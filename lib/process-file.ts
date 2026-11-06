"use client";
import JSZip from "jszip";
import { PDFDocument } from "pdf-lib";
import * as XLSX from "xlsx";
import { Document, Packer, Paragraph, TextRun } from "docx";

export type ProcessOptions = { quality?: "Smaller file" | "Balanced" | "Best quality"; output?: string };
export type ProcessResult = { blob: Blob; filename: string; mime: string; message: string };
const result=(blob:Blob,filename:string,message:string):ProcessResult=>({blob,filename,mime:blob.type||"application/octet-stream",message});
const name=(file:File,ext:string)=>((file.name.replace(/\.[^.]+$/,"")||"output")+"."+ext);
const textFile=(text:string,filename:string,mime="text/plain;charset=utf-8")=>result(new Blob([text],{type:mime}),filename,"Your file is ready.");
async function image(file:File,tool:string,options:ProcessOptions):Promise<ProcessResult>{
 const bitmap=await createImageBitmap(file);let w=bitmap.width,h=bitmap.height;
 if(tool==="Resize image"){const scale=Math.min(1,2048/Math.max(w,h));w=Math.max(1,Math.round(w*scale));h=Math.max(1,Math.round(h*scale));}
 const canvas=document.createElement("canvas");canvas.width=w;canvas.height=h;const ctx=canvas.getContext("2d");if(!ctx)throw new Error("Image canvas is unavailable.");
 const fmt=(options.output|| (tool==="PNG to WEBP"?"WEBP":tool==="PNG to JPG"?"JPG":"PNG")).toUpperCase();
 if(fmt==="JPG"||fmt==="JPEG"){ctx.fillStyle="#fff";ctx.fillRect(0,0,w,h);}
 ctx.drawImage(bitmap,0,0,w,h);bitmap.close();
 const mime=fmt==="JPG"||fmt==="JPEG"?"image/jpeg":fmt==="WEBP"?"image/webp":"image/png";
 const quality=options.quality==="Smaller file"?.62:options.quality==="Best quality"?.96:.84;
 const blob=await new Promise<Blob>((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error("Image export failed.")),mime,quality));
 return result(blob,name(file,mime==="image/jpeg"?"jpg":mime==="image/webp"?"webp":"png"),"Image converted locally in your browser.");
}
async function pdf(files:File[],tool:string):Promise<ProcessResult[]>{
 if(tool==="Image to PDF"){const doc=await PDFDocument.create();for(const f of files){const bytes=await f.arrayBuffer();const img=f.type.includes("png")?await doc.embedPng(bytes):await doc.embedJpg(bytes);const p=doc.addPage([img.width,img.height]);p.drawImage(img,{x:0,y:0,width:img.width,height:img.height});}return [result(new Blob([await doc.save()],{type:"application/pdf"}),"images-combined.pdf","Images combined into one PDF.")];}
 if(tool==="Merge PDF"){const doc=await PDFDocument.create();for(const f of files){const src=await PDFDocument.load(await f.arrayBuffer());(await doc.copyPages(src,src.getPageIndices())).forEach(p=>doc.addPage(p));}return [result(new Blob([await doc.save()],{type:"application/pdf"}),"merged.pdf","PDFs merged in selection order.")];}
 if(tool==="Split PDF"){const src=await PDFDocument.load(await files[0].arrayBuffer());const zip=new JSZip();for(let i=0;i<src.getPageCount();i++){const part=await PDFDocument.create();const [p]=await part.copyPages(src,[i]);part.addPage(p);zip.file("page-"+String(i+1).padStart(3,"0")+".pdf",await part.save());}return [result(await zip.generateAsync({type:"blob"}),name(files[0],"zip"),"PDF pages exported separately in a ZIP.")];}
 if(tool==="Compress PDF"||tool==="Organize PDF"){const src=await PDFDocument.load(await files[0].arrayBuffer());return [result(new Blob([await src.save({useObjectStreams:true})],{type:"application/pdf"}),name(files[0],"pdf"),"PDF rewritten with compact object streams; embedded images are not recompressed.")];}
 throw new Error(tool+" needs a specialized PDF engine not available in this build.");
}
async function spreadsheet(file:File,tool:string):Promise<ProcessResult[]>{
 const wb=XLSX.read(await file.arrayBuffer(),{type:"array"});
 if(tool==="Remove duplicates")wb.SheetNames.forEach(n=>{const rows=XLSX.utils.sheet_to_json<unknown[]>(wb.Sheets[n],{header:1});const seen=new Set<string>();wb.Sheets[n]=XLSX.utils.aoa_to_sheet(rows.filter(r=>{const k=JSON.stringify(r);if(seen.has(k))return false;seen.add(k);return true;}));});
 if(tool==="Excel to PDF"){const csv=XLSX.utils.sheet_to_csv(wb.Sheets[wb.SheetNames[0]]);return [textFile(csv,name(file,"csv"),"text/csv;charset=utf-8")];}
 const bytes=XLSX.write(wb,{type:"array",bookType:"xlsx"});return [result(new Blob([bytes],{type:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"}),name(file,"xlsx"),"Spreadsheet prepared locally.")];
}
async function archive(files:File[],tool:string):Promise<ProcessResult>{
 const zip=new JSZip();if(tool==="Create ZIP"){files.forEach(f=>zip.file(f.name,f));return result(await zip.generateAsync({type:"blob"}),"convotools-archive.zip","Files packed into a ZIP archive.");}
 const src=await JSZip.loadAsync(files[0]);const out=new JSZip();await Promise.all(Object.values(src.files).filter(f=>!f.dir).map(async f=>out.file(f.name,await f.async("uint8array"))));return result(await out.generateAsync({type:"blob"}),name(files[0],"zip"),"Archive entries extracted and repacked into a standard ZIP.");
}
async function textTool(file:File,tool:string):Promise<ProcessResult>{
 const value=await file.text();if(tool==="JSON formatter")return textFile(JSON.stringify(JSON.parse(value),null,2)+"\n",name(file,"json"),"application/json");
 if(tool==="Base64 tools")return textFile(btoa(unescape(encodeURIComponent(value))),name(file,"b64"),"text/plain");
 if(tool==="DOCX to TXT"){const mammoth=await import("mammoth/mammoth.browser");const extracted=await mammoth.extractRawText({arrayBuffer:await file.arrayBuffer()});return textFile(extracted.value,name(file,"txt"));}
 throw new Error("Unsupported text operation.");
}
export async function processFiles(files:File[],tool:string,options:ProcessOptions={}):Promise<ProcessResult[]>{
 if(!files.length)throw new Error("Choose at least one file.");
 if(["PNG to JPG","JPG to PNG","PNG to WEBP","WEBP converter","Image compressor","Resize image","Crop & rotate"].includes(tool))return Promise.all(files.map(f=>image(f,tool,options)));
 if(["Image to PDF","Merge PDF","Split PDF","Compress PDF","Organize PDF"].includes(tool))return pdf(files,tool);
 if(["CSV to XLSX","Remove duplicates","Excel to PDF"].includes(tool))return spreadsheet(files[0],tool);
 if(["Create ZIP","Extract archive"].includes(tool))return [await archive(files,tool)];
 if(["JSON formatter","Base64 tools","DOCX to TXT"].includes(tool))return [await textTool(files[0],tool)];
 if(tool==="Hash generator"){const digest=await crypto.subtle.digest("SHA-256",await files[0].arrayBuffer());const hash=Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,"0")).join("");return [textFile(hash+"  "+files[0].name+"\n",name(files[0],"sha256"))];}
 if(tool==="QR generator"){const QR=await import("qrcode");const url=await QR.toDataURL(await files[0].text(),{errorCorrectionLevel:"H",width:1024});const blob=await (await fetch(url)).blob();return [result(blob,"convotools-qr.png","QR generated locally.")];}
 if(tool==="Word editor"){const doc=new Document({sections:[{children:(await files[0].text()).split(/\r?\n/).map(line=>new Paragraph({children:[new TextRun(line)]}))}]});return [result(await Packer.toBlob(doc),"convotools-document.docx","Word document generated from the text content.")];}
 throw new Error(tool+" is not connected to a real processing engine yet. No placeholder output was created. This operation needs a dedicated conversion or AI provider.");
}
export function saveProcessedFile(item:ProcessResult){const url=URL.createObjectURL(item.blob);const a=document.createElement("a");a.href=url;a.download=item.filename;document.body.appendChild(a);a.click();a.remove();window.setTimeout(()=>URL.revokeObjectURL(url),1500);}
