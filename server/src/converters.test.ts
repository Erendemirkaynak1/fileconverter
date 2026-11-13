import {describe,it,expect} from "vitest";
import {convert} from "./converters";
import {PDFDocument} from "pdf-lib";
import JSZip from "jszip";

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
  const workbook=new (await import("exceljs")).default.Workbook();
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
