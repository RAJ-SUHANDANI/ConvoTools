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

async function pdfJsDocument(file:File) {
 const pdfjs=await import("pdfjs-dist/legacy/build/pdf.mjs");
 return pdfjs.getDocument({data:await file.arrayBuffer(),disableWorker:true}).promise;
}
async function renderPdfPages(file:File,format:"png"|"jpeg"="png"):Promise<Blob[]> {
 const doc=await pdfJsDocument(file);const pages:Blob[]=[];
 for(let n=1;n<=doc.numPages;n++){
  const page=await doc.getPage(n);const viewport=page.getViewport({scale:1.65});
  const canvas=document.createElement("canvas");canvas.width=Math.ceil(viewport.width);canvas.height=Math.ceil(viewport.height);
  const ctx=canvas.getContext("2d");if(!ctx)throw new Error("Canvas is unavailable.");
  await page.render({canvasContext:ctx,viewport,canvas}).promise;
  const blob=await new Promise<Blob>((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error("Could not export rendered PDF page.")),format==="jpeg"?"image/jpeg":"image/png",.92));
  pages.push(blob);canvas.width=0;canvas.height=0;
 }
 return pages;
}
async function pdfText(file:File):Promise<string>{
 const doc=await pdfJsDocument(file);const output:string[]=[];
 for(let n=1;n<=doc.numPages;n++){const page=await doc.getPage(n);const content=await page.getTextContent();output.push(content.items.map((item)=>"str" in item?item.str:"").join(" "));}
 return output.join("\n\n");
}
async function ocrImage(file:File):Promise<string>{
 const Tesseract=await import("tesseract.js");const worker=await Tesseract.createWorker("eng");
 try{const {data}=await worker.recognize(file);return data.text;}finally{await worker.terminate();}
}
async function ocrPdf(file:File):Promise<string>{
 const pages=await renderPdfPages(file,"png");const Tesseract=await import("tesseract.js");const worker=await Tesseract.createWorker("eng");const text:string[]=[];
 try{for(const page of pages){const {data}=await worker.recognize(page);text.push(data.text);}}finally{await worker.terminate();}
 return text.join("\n\n");
}
async function makeDocx(text:string,filename:string):Promise<ProcessResult>{
 const doc=new Document({sections:[{children:text.split(/\r?\n/).map(line=>new Paragraph({children:[new TextRun(line)]}))}]});
 return result(await Packer.toBlob(doc),filename,"Editable Word document generated from extracted text.");
}
async function makePdf(text:string,filename:string):Promise<ProcessResult>{
 const {jsPDF}=await import("jspdf");const pdf=new jsPDF({unit:"pt",format:"a4"});const margin=42;const lines=pdf.splitTextToSize(text||" ",pdf.internal.pageSize.getWidth()-margin*2);let y=margin;
 for(const line of lines){if(y>pdf.internal.pageSize.getHeight()-margin){pdf.addPage();y=margin;}pdf.text(line,margin,y);y+=14;}
 return result(pdf.output("blob"),filename,"PDF generated from extracted text. Original page layout and styling are not retained.");
}
async function pptxText(file:File):Promise<string>{
 const zip=await JSZip.loadAsync(file);const slideFiles=Object.keys(zip.files).filter(k=>/^ppt\/slides\/slide\d+\.xml$/.test(k)).sort((a,b)=>Number(a.match(/slide(\d+)/)?.[1])-Number(b.match(/slide(\d+)/)?.[1]));
 if(!slideFiles.length)throw new Error("No readable slides were found in this PowerPoint file.");
 const slides:string[]=[];
 for(const path of slideFiles){const xml=await zip.file(path)!.async("text");const parts=[...xml.matchAll(/<a:t>([\s\S]*?)<\/a:t>/g)].map(m=>m[1].replace(/&amp;/g,"&").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&quot;/g,'"').replace(/&apos;/g,"'"));slides.push(parts.join(" "));}
 return slides.map((s,i)=>"SLIDE "+(i+1)+"\n"+s).join("\n\n");
}
async function pdfAdvanced(files:File[],tool:string):Promise<ProcessResult[]>{
 if(tool==="PDF to Word"){const text=await pdfText(files[0]);if(!text.trim())throw new Error("This PDF contains no selectable text. Try OCR extractor for scanned pages.");return [await makeDocx(text,name(files[0],"docx"))];}
 if(tool==="PDF to Excel"){const text=await pdfText(files[0]);if(!text.trim())throw new Error("No selectable text was found in this PDF.");const rows=text.split(/\r?\n/).filter(Boolean).map(line=>line.split(/\s{2,}|\t/));const sheet=XLSX.utils.aoa_to_sheet(rows);const wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,sheet,"Extracted data");return [result(new Blob([XLSX.write(wb,{type:"array",bookType:"xlsx"})],{type:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"}),name(files[0],"xlsx"),"Text rows exported to a spreadsheet. PDF table structure may require manual cleanup.")];}
 if(tool==="PDF to JPG"||tool==="PDF to PNG"||tool==="Slides to images"){const pages=await renderPdfPages(files[0],tool==="PDF to JPG"?"jpeg":"png");if(pages.length===1)return [result(pages[0],name(files[0],tool==="PDF to JPG"?"jpg":"png"),"PDF page rendered as an image.")];const zip=new JSZip();pages.forEach((p,i)=>zip.file("page-"+String(i+1).padStart(3,"0")+(tool==="PDF to JPG"?".jpg":".png"),p));return [result(await zip.generateAsync({type:"blob"}),name(files[0],"zip"),pages.length+" PDF pages rendered into image files.")];}
 if(tool==="PDF to PowerPoint"){const pages=await renderPdfPages(files[0],"jpeg");const PptxGenJS=(await import("pptxgenjs")).default;const pptx=new PptxGenJS();pptx.layout="LAYOUT_WIDE";for(const page of pages){const data=await new Promise<string>((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result));reader.onerror=()=>reject(new Error("Image conversion failed."));reader.readAsDataURL(page);});const slide=pptx.addSlide();slide.addImage({data,x:0,y:0,w:13.333,h:7.5});}return [result(await pptx.write({outputType:"blob"}) as Blob,name(files[0],"pptx"),"PDF pages placed as full-slide images in a PowerPoint file. Text is not editable.")];}
 throw new Error("Unsupported PDF operation.");
}


async function ffmpegRun(file:File,tool:string,options:ProcessOptions):Promise<ProcessResult>{
 if(file.size>180*1024*1024)throw new Error("For browser stability, video and audio files must be smaller than 180 MB.");
 const {FFmpeg}=await import("@ffmpeg/ffmpeg");
 const {fetchFile,toBlobURL}=await import("@ffmpeg/util");
 const ffmpeg=new FFmpeg();
 const core="https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/umd";
 await ffmpeg.load({coreURL:await toBlobURL(core+"/ffmpeg-core.js","text/javascript"),wasmURL:await toBlobURL(core+"/ffmpeg-core.wasm","application/wasm")});
 const input="input-"+(file.name.split(".").pop()||"bin").replace(/[^a-z0-9]/gi,"");
 const ext=(options.output||"MP3").toLowerCase().replace(/[^a-z0-9]/g,"");
 const outputExt=tool==="MP4 to GIF"?"gif":tool==="Video compressor"?"mp4":tool==="Extract audio"?"mp3":(["mp3","wav","aac","flac","ogg"].includes(ext)?ext:"mp3");
 const output="convotools-output."+outputExt;
 try{
  await ffmpeg.writeFile(input,await fetchFile(file));
  let args:string[]=[];
  if(tool==="MP4 to GIF")args=["-i",input,"-vf","fps=12,scale=720:-1:flags=lanczos","-loop","0",output];
  else if(tool==="Video compressor"){const crf=options.quality==="Smaller file"?"30":options.quality==="Best quality"?"20":"25";args=["-i",input,"-c:v","libx264","-preset","veryfast","-crf",crf,"-c:a","aac","-b:a","128k","-movflags","+faststart",output];}
  else if(tool==="Extract audio")args=["-i",input,"-vn","-codec:a","libmp3lame","-q:a","2",output];
  else if(tool==="Audio converter"){
   const codec:Record<string,string[]>={mp3:["-c:a","libmp3lame","-q:a","2"],wav:["-c:a","pcm_s16le"],aac:["-c:a","aac","-b:a","192k"],flac:["-c:a","flac"],ogg:["-c:a","libvorbis","-q:a","5"]};
   args=["-i",input,...(codec[outputExt]||codec.mp3),output];
  }else throw new Error("Unsupported media operation.");
  const exit=await ffmpeg.exec(args);if(exit!==0)throw new Error("The media encoder could not process this file. Check that the input codec is supported.");
  const data=await ffmpeg.readFile(output);if(typeof data==="string")throw new Error("The encoder returned an invalid output.");
  const mime:Record<string,string>={gif:"image/gif",mp4:"video/mp4",mp3:"audio/mpeg",wav:"audio/wav",aac:"audio/aac",flac:"audio/flac",ogg:"audio/ogg"};
  const blob=new Blob([data],{type:mime[outputExt]||"application/octet-stream"});
  return result(blob,name(file,outputExt),"Media encoded locally in your browser with FFmpeg.");
 }finally{await ffmpeg.terminate();}
}

export async function processFiles(files:File[],tool:string,options:ProcessOptions={}):Promise<ProcessResult[]>{
 if(!files.length)throw new Error("Choose at least one file.");
 if(["PNG to JPG","JPG to PNG","PNG to WEBP","WEBP converter","Image compressor","Resize image","Crop & rotate"].includes(tool))return Promise.all(files.map(f=>image(f,tool,options)));
 if(["Image to PDF","Merge PDF","Split PDF","Compress PDF","Organize PDF"].includes(tool))return pdf(files,tool);
 if(["PDF to Word","PDF to Excel","PDF to JPG","PDF to PNG","PDF to PowerPoint"].includes(tool))return pdfAdvanced(files,tool);
 if(["CSV to XLSX","Remove duplicates"].includes(tool))return spreadsheet(files[0],tool);
 if(tool==="Excel to PDF"){const wb=XLSX.read(await files[0].arrayBuffer(),{type:"array"});const csv=wb.SheetNames.map(n=>n+"\\n"+XLSX.utils.sheet_to_csv(wb.Sheets[n])).join("\\n\\n");return [await makePdf(csv,name(files[0],"pdf"))];}
 if(["Create ZIP","Extract archive"].includes(tool))return [await archive(files,tool)];
 if(["JSON formatter","Base64 tools","DOCX to TXT"].includes(tool))return [await textTool(files[0],tool)];
 if(tool==="Word to PDF"){const mammoth=await import("mammoth/mammoth.browser");const extracted=await mammoth.extractRawText({arrayBuffer:await files[0].arrayBuffer()});return [await makePdf(extracted.value,name(files[0],"pdf"))];}
 if(tool==="PPTX to PDF"){const text=await pptxText(files[0]);return [await makePdf(text,name(files[0],"pdf"))];}
 if(tool==="Image to Word (OCR)"||tool==="OCR extractor"){const extracted=files[0].type==="application/pdf"||files[0].name.toLowerCase().endsWith(".pdf")?await ocrPdf(files[0]):await ocrImage(files[0]);return [await makeDocx(extracted,name(files[0],"docx"))];}
 if(["MP4 to GIF","Video compressor","Extract audio","Audio converter"].includes(tool))return [await ffmpegRun(files[0],tool,options)];
 if(tool==="Hash generator"){const digest=await crypto.subtle.digest("SHA-256",await files[0].arrayBuffer());const hash=Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,"0")).join("");return [textFile(hash+"  "+files[0].name+"\n",name(files[0],"sha256"))];}
 if(tool==="QR generator"){const QR=await import("qrcode");const url=await QR.toDataURL(await files[0].text(),{errorCorrectionLevel:"H",width:1024});const blob=await (await fetch(url)).blob();return [result(blob,"convotools-qr.png","QR generated locally.")];}
 if(tool==="Word editor"){const doc=new Document({sections:[{children:(await files[0].text()).split(/\r?\n/).map(line=>new Paragraph({children:[new TextRun(line)]}))}]});return [result(await Packer.toBlob(doc),"convotools-document.docx","Word document generated from the text content.")];}
 throw new Error(tool+" is not connected to a real processing engine yet. No placeholder output was created. This operation needs a dedicated conversion or AI provider.");
}
export function saveProcessedFile(item:ProcessResult){const url=URL.createObjectURL(item.blob);const a=document.createElement("a");a.href=url;a.download=item.filename;document.body.appendChild(a);a.click();a.remove();window.setTimeout(()=>URL.revokeObjectURL(url),1500);}
