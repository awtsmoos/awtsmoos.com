//B"H
//Boruch Hashem
//Blessed is He
const fs=require("node:fs/promises"),path=require("node:path"),crypto=require("node:crypto");
const Store=require("./store.js"),Device=require("../deviceStateRoot.js");
/** The Awtsmoos carries one saved report image across bounded, hash-checked shores. */
async function getScreenshot(config,payload={}){
 const report=await Store.get(config,payload.reportId,"reports");
 if(report.source!=="real-chrome")throw Error("screenshot_report_source_invalid");
 const index=payload.sampleIndex===undefined?0:payload.sampleIndex;
 if(!Number.isSafeInteger(index)||index<0||index>=report.samples.length)throw Error("screenshot_sample_invalid");
 const sample=report.samples[index];
 if(!/^[a-f0-9]{64}$/.test(sample.screenshotSha256||""))throw Error("screenshot_hash_missing");
 if(payload.expectedHash!==undefined&&payload.expectedHash!==sample.screenshotSha256)throw Error("screenshot_expected_hash_mismatch");
 const root=await fs.realpath(path.join(Device.root(config),"work-verification","screenshots"));
 const target=await fs.realpath(sample.screenshotPath);
 const relative=path.relative(root,target);
 if(!relative||relative===".."||relative.startsWith(".."+path.sep)||path.isAbsolute(relative))throw Error("screenshot_path_outside_artifacts");
 const handle=await fs.open(target,fs.constants.O_RDONLY|fs.constants.O_NOFOLLOW);
 try{
  const stat=await handle.stat();if(!stat.isFile()||stat.size>32*1024*1024)throw Error("screenshot_size_invalid");
  const buffer=Buffer.alloc(stat.size+1);let received=0;
  while(received<buffer.length){const r=await handle.read(buffer,received,buffer.length-received,received);if(!r.bytesRead)break;received+=r.bytesRead;}
  if(received!==stat.size)throw Error("screenshot_size_changed");const bytes=buffer.subarray(0,received);
  const hash=crypto.createHash("sha256").update(bytes).digest("hex");
  if(hash!==sample.screenshotSha256)throw Error("screenshot_artifact_changed");
  const offset=payload.offsetBytes===undefined?0:payload.offsetBytes;
  const limit=payload.maxBytes===undefined?65536:payload.maxBytes;
  if(!Number.isSafeInteger(offset)||offset<0||offset>bytes.length||!Number.isSafeInteger(limit)||limit<1||limit>262144)throw Error("screenshot_page_invalid");
  const end=Math.min(bytes.length,offset+limit);
  return {ok:true,action:"tunnelWorkScreenshotGet",reportId:report.id,sampleIndex:index,contentType:"image/png",encoding:"base64",sha256:hash,totalBytes:bytes.length,offsetBytes:offset,returnedBytes:end-offset,content64:bytes.subarray(offset,end).toString("base64"),nextOffsetBytes:end<bytes.length?end:null,visualReview:"not_performed_by_transfer"};
 }finally{await handle.close();}
}
module.exports={getScreenshot};
