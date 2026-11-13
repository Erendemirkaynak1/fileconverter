import {describe,it,expect} from "vitest";
import request from "supertest";
import {app} from "./app";\nimport JSZip from "jszip";

describe("HTTP API",()=>{
 it("returns health status",async()=>{
  const response=await request(app).get("/api/health");
  expect(response.status).toBe(200);
  expect(response.body.status).toBe("ok");
 });
 it("lists the supported document converters",async()=>{
  const response=await request(app).get("/api/conversions");
  expect(response.body.some((item:{id:string})=>item.id==="docx-to-pdf")).toBe(true);
  expect(response.body.some((item:{id:string})=>item.id==="pdf-to-images")).toBe(true);
 });
 it("converts multiple CSV files into a verified ZIP archive",async()=>{
  const response=await request(app).post("/api/convert/csv-to-json/batch")
   .set("Origin","http://localhost:5173")
   .attach("files",Buffer.from("name\nAda"),"one.csv")
   .attach("files",Buffer.from("name\nLin"),"two.csv");
  expect(response.status).toBe(200);
  expect(response.headers["x-conversion-verified"]).toBe("true");
  expect(response.headers["content-type"]).toContain("application/zip");
  expect(response.headers["access-control-expose-headers"]).toContain("X-Conversion-Verified");
  expect(response.headers["access-control-expose-headers"]).toContain("Content-Disposition");
 });
 it("creates a ZIP archive from multiple arbitrary files",async()=>{
  const response=await request(app).post("/api/convert/zip-create/batch")
   .attach("files",Buffer.from("alpha"),"a.txt")
   .attach("files",Buffer.from("beta"),"b.bin");
  expect(response.status).toBe(200);
  expect(response.headers["x-conversion-verified"]).toBe("true");
  const zip=await JSZip.loadAsync(response.body);
  expect(Object.keys(zip.files).filter(name=>!zip.files[name].dir)).toHaveLength(2);
 });
 it("rejects unsupported file extensions",async()=>{
  const response=await request(app).post("/api/convert/txt-utf8").attach("file",Buffer.from("hello"),"payload.exe");
  expect(response.status).toBe(415);
 });
 it("rejects unknown converters",async()=>{
  const response=await request(app).post("/api/convert/nope");
  expect(response.status).toBe(404);
 });
});
