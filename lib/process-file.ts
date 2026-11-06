"use client";
import JSZip from "jszip";
import { PDFDocument } from "pdf-lib";
import * as XLSX from "xlsx";
import { Document, Packer, Paragraph, TextRun } from "docx";

export type ProcessOptions = { quality?: "Smaller file" | "Balanced" | "Best quality"; output?: string; password?: string; pdfPageOrder?: string; width?: string; height?: string; rotation?: number; cropMode?: "Original" | "Square center crop" };
export type ProcessResult = { blob: Blob; filename: string; mime: string; message: string };
const result=(blob:Blob,filename:string,message:string):ProcessResult=>({blob,filename,mime:blob.type||"application/octet-stream",message});\nconst bytesBlob=(bytes:Uint8Array,mime:string)=>{const safe=new Uint8Array(bytes.byteLength);safe.set(bytes);return new Blob([safe.buffer],{type:mime});};
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
async function pdf(files:File[],tool:string):Promise<ProcessResult[]>{
 if(tool==="Image to PDF"){const doc=await PDFDocument.create();for(const f of files){const bytes=await f.arrayBuffer();const img=f.type.includes("png")?await doc.embedPng(bytes):await doc.embedJpg(bytes);const p=doc.addPage([img.width,img.height]);p.drawImage(img,{x:0,y:0,width:img.width,height:img.height});}return [result(bytesBlob(await doc.save(),"application/pdf"),"images-combined.pdf","Images combined into one PDF.")];}
 if(tool==="Merge PDF"){const doc=await PDFDocument.create();for(const f of files){const src=await PDFDocument.load(await f.arrayBuffer());(await doc.copyPages(src,src.getPageIndices())).forEach(p=>doc.addPage(p));}return [result(new Blob([await doc.save()],{type:"application/pdf"}),"merged.pdf","PDFs merged in selection order.")];}
 if(tool==="Split PDF"){const src=await PDFDocument.load(await files[0].arrayBuffer());const zip=new JSZip();for(let i=0;i<src.getPageCount();i++){const part=await PDFDocument.create();const [p]=await part.copyPages(src,[i]);part.addPage(p);zip.file("page-"+String(i+1).padStart(3,"0")+".pdf",await part.save());}return [result(await zip.generateAsync({type:"blob"}),name(files[0],"zip"),"PDF pages exported separately in a ZIP.")];}
 if(tool==="Compress PDF"){const src=await PDFDocument.load(await files[0].arrayBuffer());return [result(bytesBlob(await src.save({useObjectStreams:true}),"application/pdf"),name(files[0],"pdf"),"PDF rewritten with compact object streams; embedded images are not recompressed.")];}
 if(tool==="Organize PDF"){const src=await PDFDocument.load(await files[0].arrayBuffer());const count=src.getPageCount();let indices=Array.from({length:count},(_,i)=>i);const requested=options.pdfPageOrder?.trim();if(requested){const nums=requested.split(/[,\s]+/).filter(Boolean).map(Number);if(!nums.length||nums.some(n=>!Number.isInteger(n)||n<1||n>count)||new Set(nums).size!==nums.length)throw new Error("Enter valid page numbers once each, separated by commas. Example: 3, 1, 2.");indices=nums.map(n=>n-1);}const out=await PDFDocument.create();const pages=await out.copyPages(src,indices);pages.forEach(p=>out.addPage(p));return [result(bytesBlob(await out.save({useObjectStreams:true}),"application/pdf"),name(files[0],"pdf"),"PDF pages reordered or removed as requested.")];}
 throw new Error(tool+" needs a specialized PDF engine not available in this build.");
}
async function spreadsheet(file:File,tool:string):Promise<ProcessResult[]>{
 const wb=XLSX.read(await file.arrayBuffer(),{type:"array"});
 if(tool==="Remove duplicates")wb.SheetNames.forEach(n=>{const rows=XLSX.utils.sheet_to_json<unknown[]>(wb.Sheets[n],{header:1});const seen=new Set<string>();wb.Sheets[n]=XLSX.utils.aoa_to_sheet(rows.filter(r=>{const k=JSON.stringify(r);if(seen.has(k))return false;seen.add(k);return true;}));});
 if(tool==="Excel to PDF"){const csv=XLSX.utils.sheet_to_csv(wb.Sheets[wb.SheetNames[0]]);return [textFile(csv,name(file,"csv"),"text/csv;charset=utf-8")];}
 const bytes=XLSX.write(wb,{type:"array",bookType:"xlsx"});return [result(bytesBlob(bytes as Uint8Array,"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"),name(file,"xlsx"),"Spreadsheet prepared locally.")];
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
 if(tool==="PDF to Excel"){const text=await pdfText(files[0]);if(!text.trim())throw new Error("No selectable text was found in this PDF.");const rows=text.split(/\r?\n/).filter(Boolean).map(line=>line.split(/\s{2,}|\t/));const sheet=XLSX.utils.aoa_to_sheet(rows);const wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,sheet,"Extracted data");return [result(bytesBlob(XLSX.write(wb,{type:"array",bookType:"xlsx"}) as Uint8Array,"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"),name(files[0],"xlsx"),"Text rows exported to a spreadsheet. PDF table structure may require manual cleanup.")];}
 if(tool==="PDF to JPG"||tool==="PDF to PNG"||tool==="Slides to images"){const pages=await renderPdfPages(files[0],tool==="PDF to JPG"?"jpeg":"png");if(pages.length===1)return [result(pages[0],name(files[0],tool==="PDF to JPG"?"jpg":"png"),"PDF page rendered as an image.")];const zip=new JSZip();pages.forEach((p,i)=>zip.file("page-"+String(i+1).padStart(3,"0")+(tool==="PDF to JPG"?".jpg":".png"),p));return [result(await zip.generateAsync({type:"blob"}),name(files[0],"zip"),pages.length+" PDF pages rendered into image files.")];}
 if(tool==="PDF to PowerPoint"){const pages=await renderPdfPages(files[0],"jpeg");return [result(await pdfPagesToPptx(pages),name(files[0],"pptx"),"PDF pages placed as full-slide images in a PowerPoint file. Text is not editable.")];}
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
  const blob=bytesBlob(data as Uint8Array,mime[outputExt]||"application/octet-stream");
  return result(blob,name(file,outputExt),"Media encoded locally in your browser with FFmpeg.");
 }finally{await ffmpeg.terminate();}
}


async function removeImageBackground(file:File):Promise<ProcessResult>{
 const {pipeline}=await import("@huggingface/transformers");
 const segmenter=await pipeline("background-removal","Xenova/modnet",{device:"wasm",dtype:"uint8"});
 const source=URL.createObjectURL(file);
 try{
  const output=await segmenter(source);
  const first=Array.isArray(output)?output[0]:output;
  const blob=await first.toBlob("image/png");
  return result(blob,name(file,"png"),"Portrait background removed locally in your browser using MODNet. The model is downloaded on first use.");
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
 const {pipeline}=await import("@huggingface/transformers");
 const model=tool==="Photo restoration"?"Xenova/swin2SR-realworld-sr-x4-64-bsrgan-psnr":"Xenova/swin2SR-classical-sr-x2-64";
 const upscaler=await pipeline("image-to-image",model,{device:"wasm",dtype:"q8"});
 const source=URL.createObjectURL(file);
 try{
  const output=await upscaler(source);
  const raw=output as unknown as {toBlob:(type:string)=>Promise<Blob>};
  const blob=await raw.toBlob("image/png");
  return result(blob,name(file,"png"),tool==="Photo restoration"?"AI real-world 4× super-resolution completed locally. This improves low-resolution detail; it does not repair physical scratches or tears.":"AI 2× super-resolution completed locally in your browser.");
 }finally{URL.revokeObjectURL(source);}
}

export async function processFiles(files:File[],tool:string,options:ProcessOptions={}):Promise<ProcessResult[]>{
 if(!files.length)throw new Error("Choose at least one file.");
 if(["PNG to JPG","JPG to PNG","PNG to WEBP","WEBP converter","Image compressor","Resize image","Crop & rotate"].includes(tool))return Promise.all(files.map(f=>image(f,tool,options)));
 if(["Image to PDF","Merge PDF","Split PDF","Compress PDF","Organize PDF"].includes(tool))return pdf(files,tool);
 if(tool==="Protect PDF"){const password=options.password?.trim();if(!password||password.length<6)throw new Error("Enter a password with at least 6 characters.");const {PDFDocument:SecurePDF}=await import("@cantoo/pdf-lib");const doc=await SecurePDF.load(await files[0].arrayBuffer());doc.encrypt({userPassword:password,ownerPassword:password+"-"+crypto.randomUUID()});return [result(new Blob([await doc.save()],{type:"application/pdf"}),name(files[0],"pdf"),"PDF encrypted with AES-256 password protection.")];}
 if(["PDF to Word","PDF to Excel","PDF to JPG","PDF to PNG","PDF to PowerPoint"].includes(tool))return pdfAdvanced(files,tool);
 if(["CSV to XLSX","Remove duplicates"].includes(tool))return spreadsheet(files[0],tool);
 if(tool==="Excel to PDF"){const wb=XLSX.read(await files[0].arrayBuffer(),{type:"array"});const csv=wb.SheetNames.map(n=>n+"\\n"+XLSX.utils.sheet_to_csv(wb.Sheets[n])).join("\\n\\n");return [await makePdf(csv,name(files[0],"pdf"))];}
 if(["Create ZIP","Extract archive"].includes(tool))return [await archive(files,tool)];
 if(["JSON formatter","Base64 tools","DOCX to TXT"].includes(tool))return [await textTool(files[0],tool)];
 if(tool==="Word to PDF"){const mammoth=await import("mammoth/mammoth.browser");const extracted=await mammoth.extractRawText({arrayBuffer:await files[0].arrayBuffer()});return [await makePdf(extracted.value,name(files[0],"pdf"))];}
 if(tool==="PPTX to PDF"){const text=await pptxText(files[0]);return [await makePdf(text,name(files[0],"pdf"))];}
 if(tool==="Image to Word (OCR)"||tool==="OCR extractor"){const extracted=files[0].type==="application/pdf"||files[0].name.toLowerCase().endsWith(".pdf")?await ocrPdf(files[0]):await ocrImage(files[0]);return [await makeDocx(extracted,name(files[0],"docx"))];}
 if(tool==="Background remover")return [await removeImageBackground(files[0])];
 if(tool==="Image enhancer"||tool==="Photo restoration")return [await upscaleImage(files[0],tool)];
 if(["MP4 to GIF","Video compressor","Extract audio","Audio converter"].includes(tool))return [await ffmpegRun(files[0],tool,options)];
 if(tool==="Hash generator"){const digest=await crypto.subtle.digest("SHA-256",await files[0].arrayBuffer());const hash=Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,"0")).join("");return [textFile(hash+"  "+files[0].name+"\n",name(files[0],"sha256"))];}
 if(tool==="QR generator"){const QR=await import("qrcode");const url=await QR.toDataURL(await files[0].text(),{errorCorrectionLevel:"H",width:1024});const blob=await (await fetch(url)).blob();return [result(blob,"convotools-qr.png","QR generated locally.")];}
 if(tool==="Word editor"){const doc=new Document({sections:[{children:(await files[0].text()).split(/\r?\n/).map(line=>new Paragraph({children:[new TextRun(line)]}))}]});return [result(await Packer.toBlob(doc),"convotools-document.docx","Word document generated from the text content.")];}
 throw new Error(tool+" is not connected to a real processing engine yet. No placeholder output was created. This operation needs a dedicated conversion or AI provider.");
}
export function saveProcessedFile(item:ProcessResult){const url=URL.createObjectURL(item.blob);const a=document.createElement("a");a.href=url;a.download=item.filename;document.body.appendChild(a);a.click();a.remove();window.setTimeout(()=>URL.revokeObjectURL(url),1500);}
