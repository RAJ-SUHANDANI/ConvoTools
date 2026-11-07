"use client";
import JSZip from "jszip";
import { PDFDocument, degrees } from "pdf-lib";
import * as XLSX from "xlsx";
import { Document, ImageRun, Packer, Paragraph, TextRun } from "docx";
import { analyzePdfForOffice, reconstructPdfToDocx, type PdfDetectedTable, type PdfLayoutPage } from "@/lib/pdf-document-engine";
type PptxPresentation = InstanceType<typeof import("pptxgenjs").default>;
type PptxSlide = ReturnType<PptxPresentation["addSlide"]>;
type PptxShapeName = Parameters<PptxSlide["addShape"]>[0];

export type ProcessOptions = { quality?: "Smaller file" | "Balanced" | "Best quality"; output?: string; password?: string; pdfPageOrder?: string; width?: string; height?: string; rotation?: number; cropMode?: "Original" | "Square center crop"; textContent?: string; base64Mode?: "Encode" | "Decode"; decodedFormat?: string; ocrFormat?: "DOCX" | "TXT"; ocrLanguage?: string; pdfRotation?: number; qrFormat?: "PNG" | "SVG"; hashAlgorithm?: "SHA-256" | "SHA-384" | "SHA-512"; qrText?: string; onProgress?: (progress: number, phase?: string) => void };
export type ProcessResult = { blob: Blob; filename: string; mime: string; message: string };
const result=(blob:Blob,filename:string,message:string):ProcessResult=>({blob,filename,mime:blob.type||"application/octet-stream",message});
const bytesBlob=(bytes:Uint8Array,mime:string)=>{const safe=new Uint8Array(bytes.byteLength);safe.set(bytes);return new Blob([safe.buffer],{type:mime});};
const name=(file:File,ext:string)=>((file.name.replace(/\.[^.]+$/,"")||"output")+"."+ext);
const textFile=(text:string,filename:string,mime="text/plain;charset=utf-8")=>result(new Blob([text],{type:mime}),filename,"Your file is ready.");
async function image(file:File,tool:string,options:ProcessOptions):Promise<ProcessResult>{
 const bitmap=await createImageBitmap(file);let w=bitmap.width,h=bitmap.height;
 if(tool==="Resize image"){const requestedW=Number(options.width)||0,requestedH=Number(options.height)||0;if(requestedW>0&&requestedH>0){w=Math.min(8192,Math.round(requestedW));h=Math.min(8192,Math.round(requestedH));}else if(requestedW>0){h=Math.round(bitmap.height*requestedW/bitmap.width);w=Math.min(8192,Math.round(requestedW));}else if(requestedH>0){w=Math.round(bitmap.width*requestedH/bitmap.height);h=Math.min(8192,Math.round(requestedH));}else{const scale=Math.min(1,2048/Math.max(w,h));w=Math.max(1,Math.round(w*scale));h=Math.max(1,Math.round(h*scale));}}
 const rotation=((Number(options.rotation)||0)%360+360)%360;const crop=tool==="Crop & rotate"&&options.cropMode==="Square center crop";const side=Math.min(w,h);const sw=crop?side:w,sh=crop?side:h,sx=crop?(w-side)/2:0,sy=crop?(h-side)/2:0;
 const rotated=rotation===90||rotation===270;const canvas=document.createElement("canvas");canvas.width=rotated?sh:sw;canvas.height=rotated?sw:sh;const ctx=canvas.getContext("2d");if(!ctx)throw new Error("Image canvas is unavailable.");
 const originalFmt=file.type==="image/jpeg"?"JPG":file.type==="image/webp"?"WEBP":"PNG";
 const requested=(options.output||"").toUpperCase();const fmt=!requested||requested==="IMAGE"||requested==="OPTIMIZED IMAGE"?originalFmt:requested;
 if(fmt==="JPG"||fmt==="JPEG"){ctx.fillStyle="#fff";ctx.fillRect(0,0,canvas.width,canvas.height);}
 ctx.translate(canvas.width/2,canvas.height/2);ctx.rotate(rotation*Math.PI/180);ctx.drawImage(bitmap,sx,sy,sw,sh,-sw/2,-sh/2,sw,sh);bitmap.close();
 const mime=fmt==="JPG"||fmt==="JPEG"?"image/jpeg":fmt==="WEBP"?"image/webp":"image/png";
 const quality=options.quality==="Smaller file"?.62:options.quality==="Best quality"?.96:.84;
 const blob=await new Promise<Blob>((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error("Image export failed.")),mime,quality));
 return result(blob,name(file,mime==="image/jpeg"?"jpg":mime==="image/webp"?"webp":"png"),"Image converted locally in your browser.");
}

async function compressPdfRaster(file:File,preset:ProcessOptions["quality"]):Promise<ProcessResult>{
 const scale=preset==="Smaller file"?1:preset==="Best quality"?1.85:1.35;
 const jpegQuality=preset==="Smaller file"?.58:preset==="Best quality"?.88:.75;
 const original=await pdfJsDocument(file);if(original.numPages>150)throw new Error("PDF image compression is limited to 150 pages per file to protect browser memory.");const rendered=await renderPdfPages(file,"jpeg",scale,jpegQuality);
 const output=await PDFDocument.create();
 for(let i=0;i<rendered.length;i++){
  const sourcePage=await original.getPage(i+1);const viewport=sourcePage.getViewport({scale:1});
  const image=await output.embedJpg(await rendered[i].arrayBuffer());
  const page=output.addPage([viewport.width,viewport.height]);
  page.drawImage(image,{x:0,y:0,width:viewport.width,height:viewport.height});
 }
 const blob=bytesBlob(await output.save({useObjectStreams:true}),"application/pdf");
 const ratio=file.size?Math.round(blob.size/file.size*100):0;
 return result(blob,name(file,"pdf"),"Pages rasterized and recompressed as JPEG at "+Math.round(jpegQuality*100)+"% quality. Output is "+ratio+"% of the original size. Searchable text, links and form fields are flattened.");
}

async function pdf(files:File[],tool:string,options:ProcessOptions):Promise<ProcessResult[]>{
 if(tool==="Image to PDF"){const doc=await PDFDocument.create();for(const file of files){const bitmap=await createImageBitmap(file);const canvas=document.createElement("canvas");canvas.width=bitmap.width;canvas.height=bitmap.height;const ctx=canvas.getContext("2d");if(!ctx)throw new Error("Image canvas is unavailable.");ctx.drawImage(bitmap,0,0);bitmap.close();const png=await new Promise<Blob>((resolve,reject)=>canvas.toBlob(value=>value?resolve(value):reject(new Error("Could not prepare an image for PDF.")),"image/png"));const image=await doc.embedPng(await png.arrayBuffer());const page=doc.addPage([image.width,image.height]);page.drawImage(image,{x:0,y:0,width:image.width,height:image.height});canvas.width=0;canvas.height=0;}return [result(bytesBlob(await doc.save(),"application/pdf"),"images-combined.pdf","Images converted and combined into one PDF.")];}
 if(tool==="Merge PDF"){const doc=await PDFDocument.create();for(const f of files){const src=await PDFDocument.load(await f.arrayBuffer());(await doc.copyPages(src,src.getPageIndices())).forEach(p=>doc.addPage(p));}return [result(bytesBlob(await doc.save(),"application/pdf"),"merged.pdf","PDFs merged in selection order.")];}
 if(tool==="Split PDF"){const src=await PDFDocument.load(await files[0].arrayBuffer());const zip=new JSZip();const count=src.getPageCount();const input=options.pdfPageOrder?.trim();const indices=input?input.split(/[,\s]+/).filter(Boolean).map(Number).map(n=>n-1):Array.from({length:count},(_,i)=>i);if(!indices.length||indices.some(n=>!Number.isInteger(n)||n<0||n>=count)||new Set(indices).size!==indices.length)throw new Error("Enter valid page numbers once each. Example: 1, 3, 5.");for(const i of indices){const part=await PDFDocument.create();const [page]=await part.copyPages(src,[i]);part.addPage(page);zip.file("page-"+String(i+1).padStart(3,"0")+".pdf",await part.save());}return [result(await zip.generateAsync({type:"blob"}),name(files[0],"zip"),indices.length+" selected pages exported to a ZIP.")];}
 if(tool==="Compress PDF")return [await compressPdfRaster(files[0],options.quality)];
 if(tool==="Organize PDF"){const src=await PDFDocument.load(await files[0].arrayBuffer());const count=src.getPageCount();let indices=Array.from({length:count},(_,i)=>i);const requested=options.pdfPageOrder?.trim();if(requested){const nums=requested.split(/[,\s]+/).filter(Boolean).map(Number);if(!nums.length||nums.some(n=>!Number.isInteger(n)||n<1||n>count)||new Set(nums).size!==nums.length)throw new Error("Enter valid page numbers once each, separated by commas. Example: 3, 1, 2.");indices=nums.map(n=>n-1);}const out=await PDFDocument.create();const pages=await out.copyPages(src,indices);pages.forEach(p=>{p.setRotation(degrees(((p.getRotation().angle+(options.pdfRotation||0))%360+360)%360));out.addPage(p);});return [result(bytesBlob(await out.save({useObjectStreams:true}),"application/pdf"),name(files[0],"pdf"),"PDF pages reordered, removed or rotated as requested.")];}
 throw new Error(tool+" needs a specialized PDF engine not available in this build.");
}
async function spreadsheet(file:File,tool:string):Promise<ProcessResult[]>{
 const wb=XLSX.read(await file.arrayBuffer(),{type:"array"});
 if(tool==="Remove duplicates")wb.SheetNames.forEach(n=>{const rows=XLSX.utils.sheet_to_json<unknown[]>(wb.Sheets[n],{header:1});const seen=new Set<string>();wb.Sheets[n]=XLSX.utils.aoa_to_sheet(rows.filter(r=>{const k=JSON.stringify(r);if(seen.has(k))return false;seen.add(k);return true;}));});
 if(tool==="Excel to PDF"){const csv=XLSX.utils.sheet_to_csv(wb.Sheets[wb.SheetNames[0]]);return [textFile(csv,name(file,"csv"),"text/csv;charset=utf-8")];}
 const bytes=XLSX.write(wb,{type:"array",bookType:"xlsx"});return [result(bytesBlob(bytes as Uint8Array,"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"),name(file,"xlsx"),"Spreadsheet prepared locally.")];
}
async function archive(files:File[],tool:string):Promise<ProcessResult[]>{
 if(tool==="Create ZIP"){const zip=new JSZip();files.forEach(f=>zip.file(f.name,f));return [result(await zip.generateAsync({type:"blob"}),"convotools-archive.zip","Files packed into a ZIP archive.")];}
 const sourceFile=files[0];if(!sourceFile.name.toLowerCase().endsWith(".zip"))throw new Error("The local extractor supports ZIP files. 7Z, RAR and TAR need a separate archive engine.");
 const zip=await JSZip.loadAsync(sourceFile);const entries=Object.values(zip.files).filter(f=>!f.dir&&!f.name.split("/").some(part=>part===".."||part===""));
 if(!entries.length)throw new Error("This ZIP archive contains no files.");
 if(entries.length>250)throw new Error("This ZIP contains over 250 files. Extract a smaller archive to protect browser memory.");
 return Promise.all(entries.map(async(entry,index)=>{const safe=entry.name.replace(/[^a-zA-Z0-9._/-]/g,"_").split("/").filter(Boolean).join("__")||"file-"+index;return result(await entry.async("blob"),safe,"Extracted from "+sourceFile.name+" · "+entry.name);}));
}


function encodeBase64Bytes(bytes:Uint8Array):string{
 let output="";const step=0x8000;
 for(let i=0;i<bytes.length;i+=step)output+=String.fromCharCode(...bytes.subarray(i,Math.min(i+step,bytes.length)));
 return btoa(output);
}
async function processBase64(file:File,options:ProcessOptions):Promise<ProcessResult[]>{
 if(file.size>45*1024*1024)throw new Error("Base64 processing is limited to 45 MB per file to protect browser memory.");
 if(options.base64Mode==="Decode"){
  const encoded=(await file.text()).trim().replace(/^data:[^,]*;base64,/i,"").replace(/\s/g,"");
  if(!encoded)throw new Error("The selected file contains no Base64 text.");
  let binary:string;try{binary=atob(encoded);}catch{throw new Error("The selected file does not contain valid Base64 text.");}
  const bytes=new Uint8Array(binary.length);for(let i=0;i<binary.length;i++)bytes[i]=binary.charCodeAt(i);
  const ext=(options.decodedFormat||"BIN").toLowerCase(),mimes:Record<string,string>={txt:"text/plain",json:"application/json",png:"image/png",jpg:"image/jpeg",pdf:"application/pdf",bin:"application/octet-stream"};
  return [result(new Blob([bytes.buffer],{type:mimes[ext]||"application/octet-stream"}),name(file,ext),"Decoded "+bytes.length.toLocaleString()+" bytes from Base64.")];
 }
 return [textFile(encodeBase64Bytes(new Uint8Array(await file.arrayBuffer())),name(file,"base64.txt"),"File encoded as Base64 text locally in your browser.")];
}

async function textTool(file:File,tool:string):Promise<ProcessResult>{
 if(tool==="DOCX to TXT"){const mammoth=await import("mammoth");const extracted=await mammoth.extractRawText({arrayBuffer:await file.arrayBuffer()});return textFile(extracted.value,name(file,"txt"));}
 throw new Error("Unsupported text operation.");
}

async function pdfJsDocument(file:File) {
 const pdfjs=await import("pdfjs-dist/legacy/build/pdf.mjs");
 // Serve the exact matching PDF.js worker from the same origin. This avoids
 // webpack URL rewriting, CDN/CSP failures and the "workerSrc not specified" fallback.
 const workerUrl = "/pdf.worker.mjs";
 pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
 const data = new Uint8Array(await file.arrayBuffer());
 try {
  return await pdfjs.getDocument({ data }).promise;
 } catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  if (/GlobalWorkerOptions\.workerSrc|fake worker|worker.*failed/i.test(message)) {
   throw new Error("The local PDF.js worker could not start. Reload ConvoTools and try again. If the issue continues, check that /pdf.worker.mjs was deployed with the latest build.");
  }
  throw error;
 }
}
async function renderPdfPages(file:File,format:"png"|"jpeg"="png",scale=1.65,jpegQuality=.92):Promise<Blob[]> {
 const doc=await pdfJsDocument(file);const pages:Blob[]=[];
 for(let n=1;n<=doc.numPages;n++){
  const page=await doc.getPage(n);const viewport=page.getViewport({scale});
  const canvas=document.createElement("canvas");canvas.width=Math.ceil(viewport.width);canvas.height=Math.ceil(viewport.height);
  const ctx=canvas.getContext("2d");if(!ctx)throw new Error("Canvas is unavailable.");
  await page.render({canvasContext:ctx,viewport,canvas}).promise;
  const blob=await new Promise<Blob>((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error("Could not export rendered PDF page.")),format==="jpeg"?"image/jpeg":"image/png",format==="jpeg"?jpegQuality:undefined));
  pages.push(blob);canvas.width=0;canvas.height=0;
 }
 return pages;
}
async function pdfText(file:File):Promise<string>{
 const doc=await pdfJsDocument(file);const output:string[]=[];
 for(let n=1;n<=doc.numPages;n++){const page=await doc.getPage(n);const content=await page.getTextContent();output.push(content.items.map((item)=>"str" in item?item.str+("hasEOL" in item&&item.hasEOL?"\n":" "):"").join(""));}
 return output.join("\n\n");
}
async function ocrImage(file:File,language="eng"):Promise<string>{
 const Tesseract=await import("tesseract.js");const worker=await Tesseract.createWorker(language);
 try{const {data}=await worker.recognize(file);return data.text;}finally{await worker.terminate();}
}
async function ocrPdf(file:File,language="eng"):Promise<string>{
 const pages=await renderPdfPages(file,"png");const Tesseract=await import("tesseract.js");const worker=await Tesseract.createWorker(language);const text:string[]=[];
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


function pdfHexColor(color: number | null | undefined): string {
 if(color===null||color===undefined)return "222222";
 return (color>>>0).toString(16).padStart(6,"0").slice(-6).toUpperCase();
}
function officeRgb(color:[number,number,number]|null|undefined):string{
 if(!color)return "222222";
 return color.map(value=>Math.max(0,Math.min(255,Math.round(value*255))).toString(16).padStart(2,"0")).join("").toUpperCase();
}
function inTable(bbox:[number,number,number,number],tables:PdfDetectedTable[]):boolean{
 const x=(bbox[0]+bbox[2])/2,y=(bbox[1]+bbox[3])/2;
 return tables.some(table=>x>=table.bbox[0]&&x<=table.bbox[2]&&y>=table.bbox[1]&&y<=table.bbox[3]);
}
function slideLine(slide:PptxSlide,shapeType:PptxShapeName,x1:number,y1:number,x2:number,y2:number,scale:number,offsetX:number,offsetY:number,color:string,width:number){
 const dx=(x2-x1)*scale,dy=(y2-y1)*scale;
 const x=offsetX+Math.min(x1,x2)*scale,y=offsetY+Math.min(y1,y2)*scale;
 slide.addShape(shapeType,{x,y,w:Math.max(.001,Math.abs(dx)),h:Math.max(.001,Math.abs(dy)),flipH:dx<0,flipV:dy<0,line:{color,width:Math.max(.25,width*scale*72)}});
}
function bezierPoint(p0:number[],p1:number[],p2:number[],p3:number[],t:number):[number,number]{
 const mt=1-t;
 return [
  mt*mt*mt*p0[0]+3*mt*mt*t*p1[0]+3*mt*t*t*p2[0]+t*t*t*p3[0],
  mt*mt*mt*p0[1]+3*mt*mt*t*p1[1]+3*mt*t*t*p2[1]+t*t*t*p3[1]
 ];
}
async function pdfImageData(item:Extract<PdfLayoutPage["items"][number],{type:"image"}>):Promise<string>{
 const ext=item.ext.toLowerCase();
 const mime=ext==="jpg"||ext==="jpeg"?"image/jpeg":ext==="gif"?"image/gif":ext==="png"?"image/png":ext==="bmp"?"image/bmp":"";
 const dataUrl="data:"+(mime||"application/octet-stream")+";base64,"+item.data;
 if(mime)return dataUrl;
 try{
  const response=await fetch(dataUrl);const blob=await response.blob();const bitmap=await createImageBitmap(blob);
  const canvas=document.createElement("canvas");canvas.width=bitmap.width;canvas.height=bitmap.height;
  const context=canvas.getContext("2d");if(!context)throw new Error("Canvas unavailable.");
  context.drawImage(bitmap,0,0);bitmap.close();
  const png=await new Promise<Blob>((resolve,reject)=>canvas.toBlob(value=>value?resolve(value):reject(new Error("Image encoding failed.")),"image/png"));
  canvas.width=0;canvas.height=0;
  return "data:image/png;base64,"+await new Promise<string>((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result).split(",")[1]||"");reader.onerror=()=>reject(new Error("Could not encode embedded PDF image."));reader.readAsDataURL(png);});
 }catch{return "";}
}
async function pdfToEditableDocx(file:File,options:ProcessOptions):Promise<ProcessResult>{
 const blob=await reconstructPdfToDocx(file,options.onProgress);
 return result(blob,name(file,"docx"),"Editable DOCX reconstructed in your browser. Text, paragraphs, detected tables, embedded images and many vector drawings are rebuilt as Word objects. Complex multi-column layouts, unusual fonts, advanced clipping and some graphics may need manual adjustment.");
}
async function pdfToEditablePptx(file:File,options:ProcessOptions):Promise<ProcessResult>{
 const analysis=await analyzePdfForOffice(file,options.onProgress);
 const pages=analysis.pages;
 if(!pages.length||pages.every(page=>!page.items.length&&!page.drawings.length))throw new Error("No extractable text, images or vector elements were found in this PDF. Scanned pages need OCR before they can be reconstructed.");
 const PptxGenJS=(await import("pptxgenjs")).default,pptx=new PptxGenJS();
 const first=pages[0],sw=Math.max(1,Math.min(56,first.width/72)),sh=Math.max(1,Math.min(56,first.height/72));
 pptx.defineLayout({name:"PDF_SOURCE_PAGE",width:sw,height:sh});pptx.layout="PDF_SOURCE_PAGE";
 pptx.author="ConvoTools";pptx.subject="Editable PowerPoint reconstruction from PDF";pptx.title=file.name;
 let textCount=0,imageCount=0,shapeCount=0,tableCount=0,skippedImageCount=0;
 for(const page of pages){
  const slide=pptx.addSlide();slide.background={color:"FFFFFF"};
  const scale=Math.min(sw/page.width,sh/page.height),offsetX=(sw-page.width*scale)/2,offsetY=(sh-page.height*scale)/2;
  const detectedTables=page.tables||[];
  // Convert detected PDF tables into native PowerPoint tables first, then skip
  // their source text fragments to avoid duplicating table content.
  for(const table of detectedTables){
   const rows=table.rows.filter(row=>row.length>0).map(row=>row.map(cell=>cell??""));
   if(!rows.length)continue;
   const columns=Math.max(1,...rows.map(row=>row.length));
   const normalized=rows.map((row,rowIndex)=>Array.from({length:columns},(_,i)=>({
    text:String(row[i]??""),
    options:rowIndex===0
     ? {bold:true,fill:"F0F1F5",color:"292B32",fontFace:"Arial",fontSize:Math.max(6,Math.min(11,9*scale*72))}
     : {color:"292B32",fontFace:"Arial",fontSize:Math.max(6,Math.min(11,9*scale*72))}
   })));
   const x=offsetX+table.bbox[0]*scale,y=offsetY+table.bbox[1]*scale;
   const w=Math.max(.25,(table.bbox[2]-table.bbox[0])*scale),h=Math.max(.25,(table.bbox[3]-table.bbox[1])*scale);
   slide.addTable(normalized,{x,y,w,h,colW:Array(columns).fill(w/columns),rowH:Math.max(.14,h/normalized.length),margin:.035,border:{type:"solid",color:"D6D6D6",pt:.5},fill:"FFFFFF",breakLine:false,autoFit:false});
   tableCount++;
  }
  // Drawings are rebuilt as native PowerPoint shapes. Curves are approximated
  // with short editable line segments instead of being flattened to a page image.
  for(const drawing of page.drawings||[]){
   const stroke=drawing.stroke?officeRgb(drawing.stroke):"777777";
   const fill=drawing.fill?officeRgb(drawing.fill):undefined;
   for(const path of drawing.items||[]){
    if(shapeCount>12000)throw new Error("This PDF contains more than 12,000 vector path elements. Split it into smaller files for browser-based PowerPoint reconstruction.");
    if(path.type==="rect"){
     const [x0,y0,x1,y1]=path.rect;
     slide.addShape(pptx.ShapeType.rect,{x:offsetX+x0*scale,y:offsetY+y0*scale,w:Math.max(.002,(x1-x0)*scale),h:Math.max(.002,(y1-y0)*scale),line:drawing.stroke?{color:stroke,width:Math.max(.25,drawing.width*scale*72)}:{color:"FFFFFF",transparency:100},fill:fill?{color:fill,transparency:Math.round((1-drawing.fillOpacity)*100)}:{color:"FFFFFF",transparency:100}});
     shapeCount++;
    }else if(path.type==="line"){
     slideLine(slide,pptx.ShapeType.line,path.points[0][0],path.points[0][1],path.points[1][0],path.points[1][1],scale,offsetX,offsetY,stroke,drawing.width);shapeCount++;
    }else if(path.type==="quad"){
     const pts=path.points;
     for(let i=0;i<4;i++){slideLine(slide,pptx.ShapeType.line,pts[i][0],pts[i][1],pts[(i+1)%4][0],pts[(i+1)%4][1],scale,offsetX,offsetY,stroke,drawing.width);shapeCount++;}
    }else if(path.type==="curve"){
     const p=path.points;let prior=p[0];
     for(let step=1;step<=12;step++){const next=bezierPoint(p[0],p[1],p[2],p[3],step/12);slideLine(slide,pptx.ShapeType.line,prior[0],prior[1],next[0],next[1],scale,offsetX,offsetY,stroke,drawing.width);prior=next;shapeCount++;}
    }
   }
  }
  // Embedded PDF image blocks remain separate, selectable/resizable picture objects.
  for(const item of page.items){
   if(item.type!=="image")continue;
   const data=await pdfImageData(item);
   if(!data){skippedImageCount++;continue;}
   const [x0,y0,x1,y1]=item.bbox;
   slide.addImage({data,x:offsetX+x0*scale,y:offsetY+y0*scale,w:Math.max(.02,(x1-x0)*scale),h:Math.max(.02,(y1-y0)*scale)});
   imageCount++;
  }
  // Each text span becomes its own editable text box with source position,
  // font-size, bold/italic hints and colour retained where available.
  for(const item of page.items){
   if(item.type!=="text"||inTable(item.bbox,detectedTables)||!item.text.trim())continue;
   const [x0,y0,x1,y1]=item.bbox;
   const directionAngle=Math.atan2(item.direction[1],item.direction[0])*180/Math.PI;
   const fontName=item.font.replace(/^[A-Z]{6}\+/,"").replace(/[^a-zA-Z0-9 _-]/g,"").trim()||"Arial";
   slide.addText(item.text,{x:offsetX+x0*scale,y:offsetY+y0*scale,w:Math.max(.04,(x1-x0)*scale),h:Math.max(.08,(y1-y0)*scale),fontFace:fontName,fontSize:Math.max(4,Math.min(72,item.size*scale*72)),bold:(item.flags&16)!==0,italic:(item.flags&2)!==0,rotate:Math.abs(directionAngle)>.7?directionAngle:0,color:pdfHexColor(item.color),margin:0,fit:"shrink",valign:"middle",breakLine:false});
   textCount++;
  }
 }
 if(!textCount&&!imageCount&&!shapeCount&&!tableCount)throw new Error("The PDF contains no supported page elements to reconstruct.");
 const blob=await pptx.write({outputType:"blob"}) as Blob;
 const notes=[];
 if(skippedImageCount)notes.push(skippedImageCount+" unsupported embedded image(s) were skipped");
 notes.push("Text, detected tables, embedded images and supported vector paths are separate editable PowerPoint objects.");
 notes.push("Complex clipping masks, transparency blends, gradients, chart data and some vector paths may need manual adjustment.");
 return result(blob,name(file,"pptx"),notes.join(" "));
}
function addPdfPageTextToSheet(sheetRows:string[][],page:PdfLayoutPage){
 const textItems=page.items.filter((item):item is Extract<PdfLayoutPage["items"][number],{type:"text"}>=>item.type==="text"&&item.text.trim().length>0);
 const lines:{y:number;items:typeof textItems}[]=[];
 for(const item of textItems.sort((a,b)=>a.bbox[1]-b.bbox[1]||a.bbox[0]-b.bbox[0])){
  let line=lines.find(candidate=>Math.abs(candidate.y-item.bbox[1])<=Math.max(2,item.size*.28));
  if(!line){line={y:item.bbox[1],items:[]};lines.push(line);}line.items.push(item);
 }
 lines.sort((a,b)=>a.y-b.y);
 for(const line of lines){
  const text=line.items.sort((a,b)=>a.bbox[0]-b.bbox[0]).map(item=>item.text).join(" ").replace(/\s+/g," ").trim();
  if(text)sheetRows.push([text]);
 }
}
async function pdfToEditableExcel(file:File,options:ProcessOptions):Promise<ProcessResult>{
 const analysis=await analyzePdfForOffice(file,options.onProgress);
 const workbook=XLSX.utils.book_new();let tableCount=0,otherTextPages=0;
 for(const page of analysis.pages){
  for(const table of page.tables||[]){
   const rows=table.rows.map(row=>row.map(cell=>String(cell??"")));
   if(!rows.length)continue;
   const columns=Math.max(1,...rows.map(row=>row.length));
   const normalized=rows.map(row=>Array.from({length:columns},(_,i)=>row[i]??""));
   const sheet=XLSX.utils.aoa_to_sheet(normalized);
   sheet["!cols"]=Array.from({length:columns},(_,index)=>({wch:Math.max(12,Math.min(42,Math.max(...normalized.map(row=>(row[index]||"").length),12)+2))}));
   sheet["!autofilter"]={ref:XLSX.utils.encode_range({s:{r:0,c:0},e:{r:Math.max(0,normalized.length-1),c:columns-1}})};
   const sheetName=("P"+page.page+" Table "+(++tableCount)).slice(0,31);
   XLSX.utils.book_append_sheet(workbook,sheet,sheetName);
  }
  const otherRows:string[][]=[];
  const outsideItems=page.items.filter(item=>item.type==="text"&&!inTable(item.bbox,page.tables||[]));
  if(outsideItems.length){addPdfPageTextToSheet(otherRows,{...page,items:outsideItems});if(otherRows.length){const sheet=XLSX.utils.aoa_to_sheet([["Extracted text"],...otherRows]);sheet["!cols"]=[{wch:100}];XLSX.utils.book_append_sheet(workbook,sheet,("P"+page.page+" Text").slice(0,31));otherTextPages++;}}
 }
 if(!workbook.SheetNames.length)throw new Error("No selectable text or table structure was detected. This PDF may be scanned or image-only; run OCR first.");
 const bytes=XLSX.write(workbook,{type:"array",bookType:"xlsx"});
 const notes=tableCount
  ? tableCount+" detected PDF table(s) reconstructed as editable spreadsheet cells. "+otherTextPages+" page(s) also contain extracted text."
  : "No reliable table grid was detected. Selectable text was exported into editable worksheet rows in reading order; arrange columns manually.";
 return result(bytesBlob(bytes as Uint8Array,"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"),name(file,"xlsx"),notes+" Merged cells, formulas, charts and semantic relationships are not inferred from PDF content.");
}
async function imageToWordDocx(file:File,recognizedText:string):Promise<ProcessResult>{
 const bitmap=await createImageBitmap(file);
 const scale=Math.min(1,1800/Math.max(bitmap.width,bitmap.height));
 const canvas=document.createElement("canvas");canvas.width=Math.max(1,Math.round(bitmap.width*scale));canvas.height=Math.max(1,Math.round(bitmap.height*scale));
 const context=canvas.getContext("2d");if(!context)throw new Error("Image canvas is unavailable.");
 context.fillStyle="#fff";context.fillRect(0,0,canvas.width,canvas.height);context.drawImage(bitmap,0,0,canvas.width,canvas.height);bitmap.close();
 const blob=await new Promise<Blob>((resolve,reject)=>canvas.toBlob(value=>value?resolve(value):reject(new Error("Could not prepare the source image for Word.")),"image/png"));
 const imageBytes=new Uint8Array(await blob.arrayBuffer());
 const imageWidth=canvas.width,imageHeight=canvas.height;canvas.width=0;canvas.height=0;
 const doc=new Document({sections:[{children:[
  new Paragraph({children:[new ImageRun({data:imageBytes,transformation:{width:imageWidth*Math.min(1,540/imageWidth,720/imageHeight),height:imageHeight*Math.min(1,540/imageWidth,720/imageHeight)}})]}),
  new Paragraph({children:[new TextRun({text:"Recognized text",bold:true})]}),
  ...recognizedText.split(/\\r?\\n/).map(line=>new Paragraph({children:[new TextRun(line)]}))
 ]}]});
 return result(await Packer.toBlob(doc),name(file,"docx"),"Source image embedded in the Word document with OCR text below it. Review OCR text for recognition errors.");
}

async function pdfAdvanced(files:File[],tool:string,options:ProcessOptions):Promise<ProcessResult[]>{
 if(tool==="PDF to Word")return [await pdfToEditableDocx(files[0],options)];
 if(tool==="PDF to Excel")return [await pdfToEditableExcel(files[0],options)];if(tool==="PDF to JPG"||tool==="PDF to PNG"){const pages=await renderPdfPages(files[0],tool==="PDF to JPG"?"jpeg":"png");if(pages.length===1)return [result(pages[0],name(files[0],tool==="PDF to JPG"?"jpg":"png"),"PDF page rendered as an image.")];const zip=new JSZip();pages.forEach((p,i)=>zip.file("page-"+String(i+1).padStart(3,"0")+(tool==="PDF to JPG"?".jpg":".png"),p));return [result(await zip.generateAsync({type:"blob"}),name(files[0],"zip"),pages.length+" PDF pages rendered into image files.")];}
 if(tool==="PDF to PowerPoint"||tool==="PDF to PPTX")return [await pdfToEditablePptx(files[0],options)];
 throw new Error("Unsupported PDF operation.");
}


async function ffmpegRun(file:File,tool:string,options:ProcessOptions):Promise<ProcessResult>{
 if(file.size>180*1024*1024)throw new Error("For browser stability, video and audio files must be smaller than 180 MB.");
 const {FFmpeg}=await import("@ffmpeg/ffmpeg");
 const {fetchFile,toBlobURL}=await import("@ffmpeg/util");
 const ffmpeg=new FFmpeg();
 ffmpeg.on("progress",({progress})=>options.onProgress?.(Math.max(0,Math.min(.995,progress))));
 try{
  const core="https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/umd";
  await ffmpeg.load({coreURL:await toBlobURL(core+"/ffmpeg-core.js","text/javascript"),wasmURL:await toBlobURL(core+"/ffmpeg-core.wasm","application/wasm")});
  const input="input-"+(file.name.split(".").pop()||"bin").replace(/[^a-z0-9]/gi,"");
  const ext=(options.output||"MP3").toLowerCase().replace(/[^a-z0-9]/g,"");
  const outputExt=tool==="MP4 to GIF"?"gif":tool==="Video compressor"?"mp4":tool==="Extract audio"?"mp3":(["mp3","wav","aac","flac","ogg"].includes(ext)?ext:"mp3");
  const output="convotools-output."+outputExt;
  await ffmpeg.writeFile(input,await fetchFile(file));
  let args:string[]=[];
  if(tool==="MP4 to GIF")args=["-i",input,"-t","30","-vf","fps=12,scale=720:-1:flags=lanczos","-loop","0",output];
  else if(tool==="Video compressor"){const crf=options.quality==="Smaller file"?"30":options.quality==="Best quality"?"20":"25";args=["-i",input,"-c:v","libx264","-preset","veryfast","-crf",crf,"-c:a","aac","-b:a","128k","-movflags","+faststart",output];}
  else if(tool==="Extract audio")args=["-i",input,"-vn","-codec:a","libmp3lame","-q:a","2",output];
  else if(tool==="Audio converter"){
   const codec:Record<string,string[]>={mp3:["-c:a","libmp3lame","-q:a","2"],wav:["-c:a","pcm_s16le"],aac:["-c:a","aac","-b:a","192k"],flac:["-c:a","flac"],ogg:["-c:a","libvorbis","-q:a","5"]};
   args=["-i",input,...(codec[outputExt]||codec.mp3),output];
  }else throw new Error("Unsupported media operation.");
  const exit=await ffmpeg.exec(args);
  if(exit!==0)throw new Error("The media encoder could not process this file. Check that the input codec is supported.");
  const data=await ffmpeg.readFile(output);
  if(typeof data==="string")throw new Error("The encoder returned an invalid output.");
  const mime:Record<string,string>={gif:"image/gif",mp4:"video/mp4",mp3:"audio/mpeg",wav:"audio/wav",aac:"audio/aac",flac:"audio/flac",ogg:"audio/ogg"};
  const blob=bytesBlob(data as Uint8Array,mime[outputExt]||"application/octet-stream");
  return result(blob,name(file,outputExt),tool==="MP4 to GIF"?"First 30 seconds encoded locally as an animated GIF.": "Media encoded locally in your browser with FFmpeg.");
 }finally{
  try{ffmpeg.terminate();}catch{/* The worker may already be closed. */}
 }
}



async function rawImageToBlob(raw:{data:Uint8Array|Uint8ClampedArray;width:number;height:number;channels:number},mime="image/png"):Promise<Blob>{
 const rgba=new Uint8ClampedArray(raw.width*raw.height*4);
 for(let i=0;i<raw.width*raw.height;i++){
  const source=i*raw.channels,target=i*4;
  if(raw.channels===1){rgba[target]=raw.data[source];rgba[target+1]=raw.data[source];rgba[target+2]=raw.data[source];rgba[target+3]=255;}
  else{rgba[target]=raw.data[source]||0;rgba[target+1]=raw.data[source+1]||0;rgba[target+2]=raw.data[source+2]||0;rgba[target+3]=raw.channels>=4?raw.data[source+3]:255;}
 }
 const canvas=document.createElement("canvas");canvas.width=raw.width;canvas.height=raw.height;
 const ctx=canvas.getContext("2d");if(!ctx)throw new Error("Image canvas is unavailable.");
 ctx.putImageData(new ImageData(rgba,raw.width,raw.height),0,0);
 return new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(new Error("Could not export AI image output.")),mime));
}

async function removeImageBackground(file:File):Promise<ProcessResult>{
 if(file.size>12*1024*1024)throw new Error("Choose an image smaller than 12 MB for local background removal.");
 const bitmap=await createImageBitmap(file);const pixels=bitmap.width*bitmap.height;bitmap.close();if(pixels>8000000)throw new Error("This image is over 8 megapixels. Resize it before using local background removal.");
 const {pipeline}=await import("@huggingface/transformers");
 const segmenter=await pipeline("background-removal","Xenova/modnet",{dtype:"fp32"});
 const source=URL.createObjectURL(file);
 try{
  const output=await segmenter(source);
  const matte=(Array.isArray(output)?output[0]:output) as {data:Uint8Array|Uint8ClampedArray;width:number;height:number;channels:number};
  const original=await createImageBitmap(file);
  try{
   const canvas=document.createElement("canvas");canvas.width=original.width;canvas.height=original.height;
   const ctx=canvas.getContext("2d");if(!ctx)throw new Error("Image canvas is unavailable.");
   ctx.drawImage(original,0,0);const pixels=ctx.getImageData(0,0,canvas.width,canvas.height);
   for(let y=0;y<canvas.height;y++)for(let x=0;x<canvas.width;x++){
    const mx=Math.min(matte.width-1,Math.floor(x*matte.width/canvas.width));
    const my=Math.min(matte.height-1,Math.floor(y*matte.height/canvas.height));
    const index=(my*matte.width+mx)*matte.channels;
    const alpha=matte.channels===1?matte.data[index]:Math.round(.299*matte.data[index]+.587*matte.data[index+1]+.114*matte.data[index+2]);
    pixels.data[(y*canvas.width+x)*4+3]=Math.max(0,Math.min(255,alpha));
   }
   ctx.putImageData(pixels,0,0);
   const blob=await new Promise<Blob>((resolve,reject)=>canvas.toBlob(value=>value?resolve(value):reject(new Error("Transparent PNG export failed.")),"image/png"));
   canvas.width=0;canvas.height=0;
   return result(blob,name(file,"png"),"Transparent portrait PNG created locally using MODNet matting. The model is downloaded on first use.");
  }finally{original.close();}
 }finally{URL.revokeObjectURL(source);}
}


async function pdfPagesToPptx(pages:Blob[]):Promise<Blob>{
 const zip=new JSZip();
 const types=['<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>','<Default Extension="xml" ContentType="application/xml"/>','<Default Extension="jpg" ContentType="image/jpeg"/>','<Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/>','<Override PartName="/ppt/slideMasters/slideMaster1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideMaster+xml"/>','<Override PartName="/ppt/slideLayouts/slideLayout1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideLayout+xml"/>','<Override PartName="/ppt/theme/theme1.xml" ContentType="application/vnd.openxmlformats-officedocument.theme+xml"/>',...pages.map((_,i)=>'<Override PartName="/ppt/slides/slide'+(i+1)+'.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>')];
 zip.file("[Content_Types].xml",'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">'+types.join("")+'</Types>');
 zip.folder("_rels")!.file(".rels",'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/></Relationships>');
 const slideIds=pages.map((_,i)=>'<p:sldId id="'+(256+i)+'" r:id="rId'+(i+2)+'"/>').join("");
 zip.folder("ppt")!.file("presentation.xml",'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><p:presentation xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"><p:sldMasterIdLst><p:sldMasterId id="2147483648" r:id="rId1"/></p:sldMasterIdLst><p:sldIdLst>'+slideIds+'</p:sldIdLst><p:sldSz cx="12192000" cy="6858000" type="screen16x9"/><p:notesSz cx="6858000" cy="9144000"/></p:presentation>');
 zip.folder("ppt")!.folder("_rels")!.file("presentation.xml.rels",'<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="slideMasters/slideMaster1.xml"/>'+pages.map((_,i)=>'<Relationship Id="rId'+(i+2)+'" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide'+(i+1)+'.xml"/>').join("")+'</Relationships>');
 const master='<p:sldMaster xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"><p:cSld><p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr></p:spTree></p:cSld><p:clrMap accent1="4F46E5" accent2="64748B" accent3="94A3B8" accent4="CBD5E1" accent5="0F172A" accent6="FFFFFF" bg1="FFFFFF" bg2="F8FAFC" folHlink="800080" hlink="0000FF" tx1="0F172A" tx2="475569"/><p:sldLayoutIdLst><p:sldLayoutId id="1" r:id="rId1"/></p:sldLayoutIdLst><p:txStyles/></p:sldMaster>';
 zip.folder("ppt")!.folder("slideMasters")!.file("slideMaster1.xml",master);
 zip.folder("ppt")!.folder("slideMasters")!.folder("_rels")!.file("slideMaster1.xml.rels",'<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme" Target="../theme/theme1.xml"/></Relationships>');
 zip.folder("ppt")!.folder("slideLayouts")!.file("slideLayout1.xml",'<p:sldLayout xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" type="blank" preserve="1"><p:cSld name="Blank"><p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr></p:spTree></p:cSld><p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr></p:sldLayout>');
 zip.folder("ppt")!.folder("slideLayouts")!.folder("_rels")!.file("slideLayout1.xml.rels",'<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="../slideMasters/slideMaster1.xml"/></Relationships>');
 zip.folder("ppt")!.folder("theme")!.file("theme1.xml",'<a:theme xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" name="ConvoTools"><a:themeElements><a:clrScheme name="ConvoTools"><a:dk1><a:srgbClr val="0F172A"/></a:dk1><a:lt1><a:srgbClr val="FFFFFF"/></a:lt1><a:dk2><a:srgbClr val="334155"/></a:dk2><a:lt2><a:srgbClr val="F8FAFC"/></a:lt2><a:accent1><a:srgbClr val="4F46E5"/></a:accent1><a:accent2><a:srgbClr val="64748B"/></a:accent2><a:accent3><a:srgbClr val="94A3B8"/></a:accent3><a:accent4><a:srgbClr val="CBD5E1"/></a:accent4><a:accent5><a:srgbClr val="0F172A"/></a:accent5><a:accent6><a:srgbClr val="FFFFFF"/></a:accent6><a:hlink><a:srgbClr val="0000FF"/></a:hlink><a:folHlink><a:srgbClr val="800080"/></a:folHlink></a:clrScheme><a:fontScheme name="ConvoTools"><a:majorFont><a:latin typeface="Aptos Display"/></a:majorFont><a:minorFont><a:latin typeface="Aptos"/></a:minorFont></a:fontScheme><a:fmtScheme name="ConvoTools"><a:fillStyleLst><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:fillStyleLst><a:lnStyleLst><a:ln w="6350"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:ln></a:lnStyleLst><a:effectStyleLst><a:effectStyle><a:effectLst/></a:effectStyle></a:effectStyleLst><a:bgFillStyleLst><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:bgFillStyleLst></a:fmtScheme></a:themeElements></a:theme>');
 const media=zip.folder("ppt")!.folder("media")!;
 for(let i=0;i<pages.length;i++){
  media.file("page"+(i+1)+".jpg",pages[i]);
  const spTree='<p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr><p:pic><p:nvPicPr><p:cNvPr id="2" name="PDF page '+(i+1)+'"/><p:cNvPicPr><a:picLocks noChangeAspect="1"/></p:cNvPicPr><p:nvPr/></p:nvPicPr><p:blipFill><a:blip r:embed="rId1"/><a:stretch><a:fillRect/></a:stretch></p:blipFill><p:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="12192000" cy="6858000"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></p:spPr></p:pic></p:spTree>';
  zip.folder("ppt")!.folder("slides")!.file("slide"+(i+1)+".xml",'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"><p:cSld>'+spTree+'</p:cSld><p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr></p:sld>');
  zip.folder("ppt")!.folder("slides")!.folder("_rels")!.file("slide"+(i+1)+".xml.rels",'<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/page'+(i+1)+'.jpg"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/></Relationships>');
 }
 return zip.generateAsync({type:"blob",mimeType:"application/vnd.openxmlformats-officedocument.presentationml.presentation"});
}


async function upscaleImage(file:File,tool:string):Promise<ProcessResult>{
 if(file.size>12*1024*1024)throw new Error("For in-browser AI processing, choose an image smaller than 12 MB.");
 const bitmap=await createImageBitmap(file);const pixels=bitmap.width*bitmap.height;bitmap.close();const pixelLimit=tool==="Photo restoration"?2000000:8000000;if(pixels>pixelLimit)throw new Error("This image exceeds the "+(pixelLimit/1000000)+" megapixel limit for this local AI model. Resize it before processing.");
 const {pipeline}=await import("@huggingface/transformers");
 const model=tool==="Photo restoration"?"Xenova/swin2SR-realworld-sr-x4-64-bsrgan-psnr":"Xenova/swin2SR-classical-sr-x2-64";
 const upscaler=await pipeline("image-to-image",model,{device:"wasm",dtype:"q8"});
 const source=URL.createObjectURL(file);
 try{
  const output=await upscaler(source);
  const raw=output as unknown as {data:Uint8Array|Uint8ClampedArray;width:number;height:number;channels:number};
  const blob=await rawImageToBlob(raw);
  return result(blob,name(file,"png"),tool==="Photo restoration"?"AI real-world 4× super-resolution completed locally. This improves low-resolution detail; it does not repair physical scratches or tears.":"AI 2× super-resolution completed locally in your browser.");
 }finally{URL.revokeObjectURL(source);}
}


const PPT_NS="http://schemas.openxmlformats.org/presentationml/2006/main";
const DRAW_NS="http://schemas.openxmlformats.org/drawingml/2006/main";
const REL_NS="http://schemas.openxmlformats.org/officeDocument/2006/relationships";
const PKG_REL_NS="http://schemas.openxmlformats.org/package/2006/relationships";
function parsePptXml(source:string){
 const parsed=new DOMParser().parseFromString(source,"application/xml");
 if(parsed.getElementsByTagName("parsererror").length)throw new Error("This PowerPoint file contains invalid slide XML.");
 return parsed;
}
type PptXmlScope=Pick<Element,"getElementsByTagNameNS">;
function pptFirst(root:PptXmlScope|null,ns:string,tag:string):Element|null{return root?root.getElementsByTagNameNS(ns,tag)[0]||null:null;}
function pptAll(root:PptXmlScope,ns:string,tag:string):Element[]{return Array.from(root.getElementsByTagNameNS(ns,tag));}
function resolvePptPath(baseFile:string,target:string):string{
 if(target.startsWith("/"))return target.slice(1);
 const parts=baseFile.split("/").slice(0,-1);
 for(const part of target.split("/")){if(!part||part===".")continue;if(part==="..")parts.pop();else parts.push(part);}
 return parts.join("/");
}
function pptColor(root:PptXmlScope|null,fallback:string):string{
 const fill=pptFirst(root,DRAW_NS,"solidFill");const rgb=pptFirst(fill,DRAW_NS,"srgbClr");
 if(rgb?.getAttribute("val"))return "#"+rgb.getAttribute("val");
 const sys=pptFirst(fill,DRAW_NS,"sysClr");if(sys?.getAttribute("lastClr"))return "#"+sys.getAttribute("lastClr");
 return fallback;
}
function pptBounds(shape:Element,sx:number,sy:number){
 const props=pptFirst(shape,PPT_NS,"spPr")||shape;const xfrm=pptFirst(props,DRAW_NS,"xfrm")||pptFirst(shape,PPT_NS,"xfrm");
 const off=pptFirst(xfrm,DRAW_NS,"off"),ext=pptFirst(xfrm,DRAW_NS,"ext");if(!off||!ext)return null;
 return {x:Number(off.getAttribute("x"))*sx,y:Number(off.getAttribute("y"))*sy,w:Number(ext.getAttribute("cx"))*sx,h:Number(ext.getAttribute("cy"))*sy};
}
function wrapSlideText(ctx:CanvasRenderingContext2D,text:string,width:number):string[]{
 const output:string[]=[];
 for(const paragraph of text.split(/\r?\n/)){let line="";for(const word of paragraph.split(/\s+/)){const next=line?line+" "+word:word;if(line&&ctx.measureText(next).width>width){output.push(line);line=word;}else line=next;}output.push(line);}
 return output;
}
async function renderPresentationSlides(file:File):Promise<Blob[]>{
 if(file.size>120*1024*1024)throw new Error("For browser-based presentation rendering, choose a PPTX smaller than 120 MB.");
 const zip=await JSZip.loadAsync(file);const presFile=zip.file("ppt/presentation.xml");
 if(!presFile)throw new Error("This file does not contain a PowerPoint presentation.");
 const presentation=parsePptXml(await presFile.async("text"));const sldSize=pptFirst(presentation,PPT_NS,"sldSz");
 const emuW=Number(sldSize?.getAttribute("cx"))||12192000,emuH=Number(sldSize?.getAttribute("cy"))||6858000;
 const canvasW=1280,canvasH=Math.max(480,Math.round(canvasW*emuH/emuW));
 const presentationRels=zip.file("ppt/_rels/presentation.xml.rels");const rels=new Map<string,string>();
 if(presentationRels){const doc=parsePptXml(await presentationRels.async("text"));for(const rel of pptAll(doc,PKG_REL_NS,"Relationship"))rels.set(rel.getAttribute("Id")||"",resolvePptPath("ppt/presentation.xml",rel.getAttribute("Target")||""));}
 let slides:string[]=pptAll(presentation,PPT_NS,"sldId").map(item=>rels.get(item.getAttributeNS(REL_NS,"id")||item.getAttribute("r:id")||"")).filter((path):path is string=>Boolean(path));
 if(!slides.length)slides=Object.keys(zip.files).filter(path=>/^ppt\/slides\/slide\d+\.xml$/.test(path)).sort((a,b)=>Number(a.match(/slide(\d+)/)?.[1])-Number(b.match(/slide(\d+)/)?.[1]));
 if(!slides.length)throw new Error("No PowerPoint slides were found.");
 const rendered:Blob[]=[];
 for(const slidePath of slides){
  const entry=zip.file(slidePath);if(!entry)continue;const slide=parsePptXml(await entry.async("text"));
  const canvas=document.createElement("canvas");canvas.width=canvasW;canvas.height=canvasH;
  const ctx=canvas.getContext("2d");if(!ctx)throw new Error("Canvas rendering is unavailable.");
  const bg=pptColor(pptFirst(slide,PPT_NS,"bg"),"#ffffff");ctx.fillStyle=bg;ctx.fillRect(0,0,canvasW,canvasH);
  const relationPath=slidePath.replace(/([^/]+)$/,"_rels/$1.rels");const imageRels=new Map<string,string>();const relationFile=zip.file(relationPath);
  if(relationFile){const doc=parsePptXml(await relationFile.async("text"));for(const rel of pptAll(doc,PKG_REL_NS,"Relationship"))imageRels.set(rel.getAttribute("Id")||"",resolvePptPath(slidePath,rel.getAttribute("Target")||""));}
  const tree=pptFirst(slide,PPT_NS,"spTree");
  const shapes=tree?Array.from(tree.children).filter(el=>el.namespaceURI===PPT_NS&&(el.localName==="sp"||el.localName==="pic")):[];
  for(const shape of shapes){
   const bounds=pptBounds(shape,canvasW/emuW,canvasH/emuH);if(!bounds||bounds.w<=0||bounds.h<=0)continue;
   if(shape.localName==="pic"){
    const blip=pptFirst(shape,DRAW_NS,"blip");const id=blip?.getAttributeNS(REL_NS,"embed")||blip?.getAttribute("r:embed")||"";
    const path=imageRels.get(id);const media=path?zip.file(path):null;
    if(media&&path){const ext=path.split(".").pop()?.toLowerCase()||"png";const mime=ext==="jpg"||ext==="jpeg"?"image/jpeg":ext==="gif"?"image/gif":"image/png";const data=await media.async("base64");const image=new Image();image.src="data:"+mime+";base64,"+data;try{await image.decode();ctx.drawImage(image,bounds.x,bounds.y,bounds.w,bounds.h);}catch{/* Unsupported embedded image files are skipped. */}}
    continue;
   }
   const props=pptFirst(shape,PPT_NS,"spPr");const fill=pptColor(props,"");
   if(fill){ctx.fillStyle=fill;const preset=pptFirst(props,DRAW_NS,"prstGeom")?.getAttribute("prst");if(preset==="ellipse"){ctx.beginPath();ctx.ellipse(bounds.x+bounds.w/2,bounds.y+bounds.h/2,bounds.w/2,bounds.h/2,0,0,Math.PI*2);ctx.fill();}else ctx.fillRect(bounds.x,bounds.y,bounds.w,bounds.h);}
   const body=pptFirst(shape,PPT_NS,"txBody");if(!body)continue;
   const paragraphs=pptAll(body,DRAW_NS,"p");let y=bounds.y+Math.max(5,bounds.h*.05);
   for(const paragraph of paragraphs){
    const text=pptAll(paragraph,DRAW_NS,"t").map(node=>node.textContent||"").join("");if(!text){y+=10;continue;}
    const style=pptFirst(paragraph,DRAW_NS,"rPr")||pptFirst(paragraph,DRAW_NS,"defRPr");
    const pt=Math.max(7,Math.min(60,Number(style?.getAttribute("sz"))/100||18));
    const px= Math.max(9,Math.min(78,pt*(canvasW/emuW*914400/72)));
    ctx.font=(style?.getAttribute("i")==="1"?"italic ":"")+(style?.getAttribute("b")==="1"?"600 ":"400 ")+px+"px Arial, sans-serif";
    ctx.fillStyle=pptColor(style,"#25262b");
    const align=pptFirst(paragraph,DRAW_NS,"pPr")?.getAttribute("algn");ctx.textAlign=align==="ctr"?"center":align==="r"?"right":"left";
    const pad=10,maxWidth=Math.max(20,bounds.w-pad*2),lines=wrapSlideText(ctx,text,maxWidth);
    const x=ctx.textAlign==="center"?bounds.x+bounds.w/2:ctx.textAlign==="right"?bounds.x+bounds.w-pad:bounds.x+pad;
    const lineH=px*1.26;for(const line of lines){if(y+lineH>bounds.y+bounds.h)break;ctx.fillText(line,x,y+px);y+=lineH;}y+=px*.15;
   }
  }
  const blob=await new Promise<Blob>((resolve,reject)=>canvas.toBlob(value=>value?resolve(value):reject(new Error("A presentation slide could not be rendered.")),"image/png"));
  rendered.push(blob);canvas.width=0;canvas.height=0;
 }
 if(!rendered.length)throw new Error("No slides could be rendered from this presentation.");
 return rendered;
}
async function presentationToPdf(pages:Blob[],filename:string):Promise<ProcessResult>{
 const {jsPDF}=await import("jspdf");const pageW=960,pageH=pageW*9/16;const pdf=new jsPDF({unit:"pt",format:[pageW,pageH],orientation:"landscape"});
 for(let i=0;i<pages.length;i++){if(i>0)pdf.addPage([pageW,pageH],"landscape");const url=await new Promise<string>((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result));reader.onerror=()=>reject(new Error("Could not prepare a slide image."));reader.readAsDataURL(pages[i]);});pdf.addImage(url,"PNG",0,0,pageW,pageH);}
 return result(pdf.output("blob"),filename,"Rendered PowerPoint slides exported to PDF. Slide text is presented as page imagery.");
}
async function slidesToImageFiles(file:File):Promise<ProcessResult[]>{
 const pages=await renderPresentationSlides(file);if(pages.length===1)return [result(pages[0],name(file,"png"),"Presentation slide rendered to PNG.")];
 const zip=new JSZip();pages.forEach((page,index)=>zip.file("slide-"+String(index+1).padStart(3,"0")+".png",page));
 return [result(await zip.generateAsync({type:"blob"}),name(file,"zip"),pages.length+" slides rendered into individual PNG images.")];
}

async function workbookToPdf(file:File):Promise<ProcessResult>{
 const workbook=XLSX.read(await file.arrayBuffer(),{type:"array"});
 const {jsPDF}=await import("jspdf");const pdf=new jsPDF({orientation:"landscape",unit:"pt",format:"a4"});
 const pageW=pdf.internal.pageSize.getWidth(),pageH=pdf.internal.pageSize.getHeight(),margin=32;let started=false;
 for(const sheetName of workbook.SheetNames){
  const rows=XLSX.utils.sheet_to_json<unknown[]>(workbook.Sheets[sheetName],{header:1,raw:false,defval:""});if(!rows.length)continue;
  const cols=Math.max(1,...rows.map(row=>row.length)),bands=Math.ceil(cols/8);
  for(let band=0;band<bands;band++){
   if(started)pdf.addPage();started=true;
   const start=band*8,count=Math.min(8,cols-start),cellW=(pageW-margin*2)/count;
   pdf.setFont("helvetica","bold");pdf.setFontSize(14);pdf.text(sheetName+(bands>1?" · columns "+(start+1)+"–"+(start+count):""),margin,margin+8);
   let y=margin+28;
   const header=()=>{pdf.setFont("helvetica","bold");pdf.setFontSize(7);for(let col=0;col<count;col++){const value=String(rows[0][start+col]??"");pdf.setFillColor(239,240,247);pdf.setDrawColor(214,216,225);pdf.rect(margin+col*cellW,y,cellW,22,"FD");pdf.text(pdf.splitTextToSize(value,cellW-8).slice(0,2),margin+col*cellW+4,y+9);}y+=22;};
   header();
   for(let rowIndex=1;rowIndex<rows.length;rowIndex++){
    const row=rows[rowIndex];pdf.setFont("helvetica","normal");pdf.setFontSize(7);
    const lines=Array.from({length:count},(_,col)=>pdf.splitTextToSize(String(row[start+col]??""),cellW-8).slice(0,4));
    const height=Math.max(18,...lines.map(line=>line.length*8+6));
    if(y+height>pageH-margin){pdf.addPage();y=margin;header();}
    for(let col=0;col<count;col++){pdf.setDrawColor(225,226,231);pdf.setFillColor(rowIndex%2?255:249,rowIndex%2?255:250,rowIndex%2?255:252);pdf.rect(margin+col*cellW,y,cellW,height,"FD");pdf.setFont("helvetica","normal");pdf.setFontSize(7);pdf.setTextColor(45,47,55);pdf.text(lines[col],margin+col*cellW+4,y+10);}
    y+=height;
   }
  }
 }
 if(!started)pdf.text("The workbook contains no printable rows.",margin,margin);
 return result(pdf.output("blob"),name(file,"pdf"),"Workbook sheets exported as paginated PDF tables. Wide sheets are separated into column groups.");
}


async function renderWordToPdf(file:File):Promise<ProcessResult>{
 const extension=file.name.split(".").pop()?.toLowerCase()||"";
 if(extension!=="docx"){
  const extracted=await extractDocumentText(file);
  return makePdf(extracted,name(file,"pdf"));
 }
 if(file.size>80*1024*1024)throw new Error("For browser stability, Word-to-PDF conversion is limited to DOCX files smaller than 80 MB.");
 const [{renderAsync},html2canvas]=await Promise.all([import("docx-preview"),import("html2canvas")]);
 const host=document.createElement("div"),styleHost=document.createElement("div");
 host.style.cssText="position:fixed;left:-100000px;top:0;width:900px;z-index:-1;background:#fff;";
 styleHost.setAttribute("data-convotools-docx-styles","");
 document.body.append(styleHost,host);
 try{
  await renderAsync(file,host,styleHost,{className:"docx",inWrapper:true,ignoreWidth:false,ignoreHeight:false,breakPages:true,renderHeaders:true,renderFooters:true,renderFootnotes:true,renderEndnotes:true});
  await Promise.all(Array.from(host.querySelectorAll("img")).map(img=>img.decode().catch(()=>undefined)));
  if("fonts" in document)await document.fonts.ready;
  const pageElements=Array.from(host.querySelectorAll<HTMLElement>(".docx"));
  if(!pageElements.length)throw new Error("The Word document could not be laid out into pages. Please check that it is a valid DOCX file.");
  if(pageElements.length>100)throw new Error("Word-to-PDF conversion is limited to 100 pages per file in the browser.");
  const {jsPDF}=await import("jspdf");
  let pdf:InstanceType<typeof jsPDF>|null=null;
  for(let index=0;index<pageElements.length;index++){
   const page=pageElements[index];
   const canvas=await html2canvas(page,{scale:1.5,backgroundColor:"#ffffff",useCORS:true,logging:false,windowWidth:Math.max(page.scrollWidth,900)});
   const widthPt=Math.max(300,Math.round(page.offsetWidth*.75));
   const heightPt=Math.max(300,Math.round(page.offsetHeight*.75));
   if(!pdf)pdf=new jsPDF({unit:"pt",format:[widthPt,heightPt],orientation:widthPt>heightPt?"landscape":"portrait"});
   else pdf.addPage([widthPt,heightPt],widthPt>heightPt?"landscape":"portrait");
   const image=canvas.toDataURL("image/jpeg",.94);
   pdf.addImage(image,"JPEG",0,0,widthPt,heightPt,undefined,"FAST");
   canvas.width=0;canvas.height=0;
  }
  if(!pdf)throw new Error("No printable pages were found in this Word document.");
  return result(pdf.output("blob"),name(file,"pdf"),"Word pages rendered with document layout, text, tables and embedded images preserved as page images. PDF content is visually rendered rather than independently editable.");
 }finally{
  host.remove();styleHost.remove();
 }
}


async function extractDocumentText(file:File):Promise<string>{
 const ext=file.name.split(".").pop()?.toLowerCase()||"";
 if(ext==="docx"){const mammoth=await import("mammoth");const value=await mammoth.extractRawText({arrayBuffer:await file.arrayBuffer()});return value.value;}
 if(ext==="txt"||ext==="md")return file.text();
 if(ext==="rtf"){
  let value=await file.text();
  value=value.replace(/\\'([0-9a-f]{2})/gi,(_,hex:string)=>String.fromCharCode(parseInt(hex,16)));
  value=value.replace(/\\u(-?\d+)\??/g,(_,code:string)=>String.fromCharCode((Number(code)+65536)%65536));
  value=value.replace(/\\par[d]?\b/g,"\n").replace(/\\line\b/g,"\n").replace(/\\tab\b/g,"\t");
  value=value.replace(/\\[a-zA-Z]+-?\d* ?/g,"").replace(/\\([{}\\])/g,"$1").replace(/[{}]/g,"");
  return value.trim();
 }
 if(ext==="odt"){
  const zip=await JSZip.loadAsync(file);const contentFile=zip.file("content.xml");if(!contentFile)throw new Error("This OpenDocument file has no readable content.xml.");
  const xml=new DOMParser().parseFromString(await contentFile.async("text"),"application/xml");
  const ns="urn:oasis:names:tc:opendocument:xmlns:text:1.0";
  const blocks=[...Array.from(xml.getElementsByTagNameNS(ns,"h")),...Array.from(xml.getElementsByTagNameNS(ns,"p"))];
  blocks.sort((left,right)=>left.compareDocumentPosition(right)&Node.DOCUMENT_POSITION_FOLLOWING?-1:1);
  if(!blocks.length)return xml.documentElement.textContent||"";
  return blocks.map(node=>node.textContent||"").join("\n");
 }
 if(ext==="doc")throw new Error("Legacy .doc files are not supported by the browser converter. Save the file as .docx, .odt, .rtf or .txt first.");
 throw new Error("This document format is not supported by the local converter.");
}

async function mapFileResults(files:File[],operation:(file:File)=>Promise<ProcessResult[]>):Promise<ProcessResult[]>{const output:ProcessResult[]=[];for(const file of files)output.push(...await operation(file));return output;}

export async function processFiles(files:File[],tool:string,options:ProcessOptions={}):Promise<ProcessResult[]>{
 if(["Image enhancer","Background remover","Photo restoration","OCR extractor"].includes(tool))throw new Error("This AI tool is temporarily locked and marked Coming soon.");
 if(!files.length&&!(tool==="QR generator"&&options.qrText?.trim()))throw new Error("Choose at least one file or enter text to generate a QR code.");
 if(["PNG to JPG","JPG to PNG","PNG to WEBP","WEBP converter","Image compressor","Resize image","Crop & rotate"].includes(tool))return Promise.all(files.map(f=>image(f,tool,options)));
 if(["Image to PDF","Merge PDF"].includes(tool))return pdf(files,tool,options);
 if(["Split PDF","Compress PDF","Organize PDF"].includes(tool))return mapFileResults(files,file=>pdf([file],tool,options));
 if(tool==="Protect PDF"){const password=options.password?.trim();if(!password||password.length<6)throw new Error("Enter a password with at least 6 characters.");return mapFileResults(files,async file=>{const {PDFDocument:SecurePDF}=await import("@cantoo/pdf-lib");const doc=await SecurePDF.load(await file.arrayBuffer());doc.encrypt({userPassword:password,ownerPassword:password+"-"+crypto.randomUUID()});return [result(bytesBlob(await doc.save(),"application/pdf"),name(file,"pdf"),"PDF encrypted with AES-256 password protection.")];});}
 if(["PDF to Word","PDF to Excel","PDF to JPG","PDF to PNG","PDF to PowerPoint","PDF to PPTX"].includes(tool))return mapFileResults(files,file=>pdfAdvanced([file],tool,options));
 if(tool==="PPTX to PDF"||tool==="Slides to images")return mapFileResults(files,async file=>{if(tool==="PPTX to PDF"){const pages=await renderPresentationSlides(file);return [await presentationToPdf(pages,name(file,"pdf"))];}return slidesToImageFiles(file);});
 if(["CSV to XLSX","Remove duplicates"].includes(tool))return mapFileResults(files,file=>spreadsheet(file,tool));
 if(tool==="Excel to PDF")return mapFileResults(files,async file=>[await workbookToPdf(file)]);
 if(tool==="Create ZIP")return archive(files,tool);
 if(tool==="Extract archive")return mapFileResults(files,file=>archive([file],tool));
 if(tool==="Base64 tools")return mapFileResults(files,file=>processBase64(file,options));
 if(tool==="DOCX to TXT")return mapFileResults(files,async file=>[await textTool(file,tool)]);
 if(tool==="Word to PDF")return mapFileResults(files,async file=>[await renderWordToPdf(file)]);
 if(tool==="PPTX to PDF"){const pages=await renderPresentationSlides(files[0]);return [await presentationToPdf(pages,name(files[0],"pdf"))];}
 if(tool==="Image to Word (OCR)"||tool==="OCR extractor"){const language=options.ocrLanguage||"eng";return mapFileResults(files,async file=>{const extracted=file.type==="application/pdf"||file.name.toLowerCase().endsWith(".pdf")?await ocrPdf(file,language):await ocrImage(file,language);return options.ocrFormat==="TXT"?[textFile(extracted,name(file,"txt"))]:[file.type.startsWith("image/")||/\\.(png|jpe?g|webp|bmp|tiff?)$/i.test(file.name)?await imageToWordDocx(file,extracted):await makeDocx(extracted,name(file,"docx"))];});}
 if(tool==="Slides to images")return slidesToImageFiles(files[0]);
 if(tool==="Background remover")return mapFileResults(files,async file=>[await removeImageBackground(file)]);
 if(tool==="Image enhancer"||tool==="Photo restoration")return mapFileResults(files,async file=>[await upscaleImage(file,tool)]);
 if(["MP4 to GIF","Video compressor","Extract audio","Audio converter"].includes(tool))return mapFileResults(files,async file=>[await ffmpegRun(file,tool,options)]);
 if(tool==="Hash generator"){const algorithm=options.hashAlgorithm||"SHA-256";return mapFileResults(files,async file=>{const digest=await crypto.subtle.digest(algorithm,await file.arrayBuffer());const hash=Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,"0")).join("");return [textFile(algorithm+"  "+hash+"  "+file.name+"\n",name(file,algorithm.toLowerCase().replace("-","")))];});}
 if(tool==="QR generator"){
  const QR=await import("qrcode");
  const items=files.length?await Promise.all(files.map(async file=>({baseName:file.name.replace(/\.[^.]+$/,"")||"qr-code",value:await file.text()}))):[{baseName:"convotools-qr",value:options.qrText||""}];
  const outputs:ProcessResult[]=[];
  for(const item of items){
   if(!item.value.trim())throw new Error("Enter a URL or text before generating a QR code.");
   if(options.qrFormat==="SVG"){
    const svg=await QR.toString(item.value,{type:"svg",errorCorrectionLevel:"H",width:1024,margin:2});
    outputs.push(textFile(svg,item.baseName+".svg","image/svg+xml"));
   }else{
    const url=await QR.toDataURL(item.value,{errorCorrectionLevel:"H",width:1024,margin:2});
    outputs.push(result(await (await fetch(url)).blob(),item.baseName+".png","QR generated locally."));
   }
  }
  return outputs;
 }
 if(tool==="Word editor"||tool==="JSON formatter")throw new Error(tool+" is an interactive workspace. Open its tool page to edit or inspect your content; no placeholder conversion is generated.");
 throw new Error(tool+" is not connected to a real processing engine yet. No placeholder output was created. This operation needs a dedicated conversion or AI provider.");
}
export function saveProcessedFile(item:ProcessResult){const url=URL.createObjectURL(item.blob);const a=document.createElement("a");a.href=url;a.download=item.filename;document.body.appendChild(a);a.click();a.remove();window.setTimeout(()=>URL.revokeObjectURL(url),60000);}
