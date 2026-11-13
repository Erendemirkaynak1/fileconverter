import {describe,it,expect} from "vitest";
import {convert} from "./converters";
import {PDFDocument} from "pdf-lib";
import JSZip from "jszip";
import ExcelJS from "exceljs";

describe("conversion engine",()=>{
 it("converts JSON arrays to CSV",async()=>{
  const result=await convert("json-to-csv",Buffer.from('[{"name":"Ada"}]'),"people.json");
  expect(result.buffer.toString()).toContain("Ada");
  expect(result.filename).toBe("people.csv");
 });
 it("rejects non-tabular JSON",async()=>{
  await expect(convert("json-to-csv",Buffer.from('{"name":"Ada"}'),"x.json")).rejects.toThrow();
 });
 it("converts CSV to JSON",async()=>{
  const result=await convert("csv-to-json",Buffer.from("name,age\nAda,36"),"x.csv");
  expect(JSON.parse(result.buffer.toString())[0].age).toBe("36");
 });
 it("converts CSV into a readable XLSX workbook",async()=>{
  const result=await convert("csv-to-xlsx",Buffer.from("name,age\nAda,36"),"people.csv");
  expect(result.filename).toBe("people.xlsx");
  const workbook=new ExcelJS.Workbook();
  await workbook.xlsx.load(result.buffer as any);
  expect(workbook.worksheets[0].getCell("A1").value).toBe("name");
 });
 it("renders Markdown to sanitized HTML",async()=>{
  const result=await convert("md-to-html",Buffer.from("# Hello\n\n<script>alert(1)</script>"),"readme.md");
  expect(result.buffer.toString()).toContain("<h1");
  expect(result.buffer.toString()).not.toContain("<script>");
 });
 it("converts plain text to a parseable PDF",async()=>{
  const result=await convert("txt-to-pdf",Buffer.from("FileConverter document test"),"note.txt");
  expect(result.buffer.subarray(0,5).toString()).toBe("%PDF-");
  expect((await PDFDocument.load(result.buffer)).getPageCount()).toBeGreaterThan(0);
 });

 it("converts a minimal DOCX document to PDF",async()=>{
  const docx=new JSZip();
  docx.file("[Content_Types].xml",'<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>');
  docx.file("_rels/.rels",'<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>');
  docx.file("word/document.xml",'<?xml version="1.0" encoding="UTF-8"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p><w:r><w:t>FileConverter DOCX test</w:t></w:r></w:p><w:sectPr/></w:body></w:document>');
  const input=await docx.generateAsync({type:"nodebuffer"});
  const result=await convert("docx-to-pdf",input,"tiny.docx");
  expect((await PDFDocument.load(result.buffer)).getPageCount()).toBeGreaterThan(0);
 });
 it("sanitizes HTML before converting it to PDF",async()=>{
  const html=Buffer.from("<html><body><h1>Safe document</h1><script>alert(1)</script></body></html>");
  const result=await convert("html-to-pdf",html,"safe.html");
  expect(result.buffer.subarray(0,5).toString()).toBe("%PDF-");
  expect((await PDFDocument.load(result.buffer)).getPageCount()).toBeGreaterThan(0);
 });
 it("renders every page of a PDF into a verified PNG archive",async()=>{
  const doc=await PDFDocument.create();doc.addPage([300,200]);doc.addPage([300,200]);
  const input=Buffer.from(await doc.save());
  const result=await convert("pdf-to-images",input,"two-pages.pdf");
  const zip=await JSZip.loadAsync(result.buffer);
  expect(Object.keys(zip.files).filter(name=>name.endsWith(".png"))).toHaveLength(2);
 });
 it("rejects malformed PDF bytes",async()=>{
  await expect(convert("pdf-to-images",Buffer.from("not a pdf"),"bad.pdf")).rejects.toThrow();
 });
 it("rejects malformed XML",async()=>{
  await expect(convert("xml-to-json",Buffer.from("<broken>"),"x.xml")).rejects.toThrow();
 });
});
