//B"H
//Boruch Hashem
//Blessed is He

"use strict";
const fs=require("node:fs/promises");
const crypto=require("node:crypto");
const {ROOT,loadConfig}=require("../../lib/config.js");
const {safePath,assertNotSecret}=require("../fs/pathGuard.js");
const cdp=require("./cdp.js");
const {connectTarget}=require("./isolatedTargetRpc.js");
const Store=require("./captureArtifactStore.js");

/** Browser-native, library-free conversion; Canvas re-encoding strips EXIF/ICC. */
async function transformImage(input={},deps={}) {
	const action="transformImage",started=Date.now();
	let stage="validation",session;
	try{
		const config=deps.config||loadConfig(),root=deps.root||ROOT;
		if(!config?.chrome?.enabled||!config?.tools?.chrome)throw new Error("chrome_disabled");
		if(!config?.tools?.fsRead)throw new Error("fs_read_disabled");
		if(!input.file||typeof input.file!=="string")throw new Error("image_file_required");
		const file=safePath(config,input.file);
		assertNotSecret(config,file);
		const stat=await fs.stat(file);
		if(!stat.isFile()||stat.size>16*1024*1024||stat.size<12)throw new Error("image_input_out_of_bounds");
		const format=String(input.format||"png").toLowerCase();
		if(!["png","jpeg","webp"].includes(format))throw new Error("unsupported_image_format");
		const width=Number(input.width||0),height=Number(input.height||0);
		if(!Number.isInteger(width)||!Number.isInteger(height)||width<0||height<0||width>4096||height>4096)throw new Error("invalid_image_dimensions");
		const quality=Math.max(1,Math.min(100,Number(input.quality||85)))/100;
		const requestId=String(input.requestId||"");
		const fingerprint=crypto.createHash("sha256").update(JSON.stringify({file,size:stat.size,mtimeMs:stat.mtimeMs,width,height,quality,format})).digest("hex");
		const cached=await Store.committed(root,requestId,fingerprint);
		if(cached)return {...cached,action,stage:"complete",cached:true,durationMs:Date.now()-started};
		const port=Number(input.port||config.chrome.port||9222);
		stage="browser_lookup";
		const pages=await(deps.pages||cdp.pages)(port);
		const target=pages.find(p=>p.type==="page"&&p.webSocketDebuggerUrl&&(input.targetId?p.id===input.targetId:true));
		if(!target)throw new Error("browser_target_not_available");
		stage="image_decode";
		session=await(deps.connectTarget||connectTarget)(target,3000);
		const image=await fs.readFile(file);
		const mime="image/"+format;
		const expression=buildTransformExpression(image.toString("base64"),{width,height,quality,mime});
		const result=await session.call("Runtime.evaluate",{expression,awaitPromise:true,returnByValue:true},12000);
		const value=result?.result?.value;
		if(!value?.base64||!value?.width||!value?.height)throw new Error("browser_image_conversion_failed");
		stage="artifact_created";
		const stored=await(deps.saveArtifact||Store.saveArtifact)(root,Buffer.from(value.base64,"base64"),{mimeType:mime,metadata:{width:value.width,height:value.height,format,quality,stripMetadata:true,sourceBytes:stat.size},requestId,fingerprint});
		return {...stored,action,stage:"complete",durationMs:Date.now()-started};
	}catch(error){return {ok:false,action,error:error.message,stage,durationMs:Date.now()-started};}
	finally{session?.close?.();}
}
function buildTransformExpression(encoded,{width,height,quality,mime}) {
	return `(async()=>{const data=atob(${JSON.stringify(encoded)});const a=new Uint8Array(data.length);for(let i=0;i<data.length;i++)a[i]=data.charCodeAt(i);const b=await createImageBitmap(new Blob([a]));const w=${width}||Math.max(1,Math.round(b.width*(${height}||b.height)/b.height));const h=${height}||Math.max(1,Math.round(b.height*w/b.width));const canvas=new OffscreenCanvas(w,h);canvas.getContext('2d').drawImage(b,0,0,w,h);b.close();const out=await canvas.convertToBlob({type:${JSON.stringify(mime)},quality:${quality}});const bytes=new Uint8Array(await out.arrayBuffer());let text='';for(let i=0;i<bytes.length;i+=32768)text+=String.fromCharCode(...bytes.subarray(i,i+32768));return {width:w,height:h,base64:btoa(text)}})()`;
}
module.exports={transformImage,buildTransformExpression};
