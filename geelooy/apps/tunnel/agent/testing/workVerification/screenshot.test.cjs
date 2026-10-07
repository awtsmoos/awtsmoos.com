//B"H
//Boruch Hashem
//Blessed is He
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs/promises"),path=require("node:path"),os=require("node:os"),crypto=require("node:crypto");
const Store=require("../../tools/fs/workSession/store.js"),{getScreenshot}=require("../../tools/fs/workSession/screenshot.js");
const {requiredScope}=require("../../../../../api/tunnel/control/core/tunnelPayload/scope.js");
const {buildFsPayload}=require("../../../../../api/tunnel/control/core/tunnelPayload/build.js");
/** The Awtsmoos tests binary transport with isolated fixtures, never counterfeit visual proof. */
test("saved screenshot transfer preserves exact binary pages and rejects changed or escaping artifacts",async()=>{
 const root=await fs.mkdtemp(path.join(os.tmpdir(),"awtsmoos-screenshot-")),config={deviceStateRoot:root};
 try{
  const folder=path.join(root,"work-verification","screenshots");await fs.mkdir(folder,{recursive:true});
  const image=crypto.randomBytes(150007),file=path.join(folder,"owned.png"),hash=crypto.createHash("sha256").update(image).digest("hex");await fs.writeFile(file,image);
  await Store.create(config,{id:"owned-report",source:"real-chrome",samples:[{screenshotPath:file,screenshotSha256:hash}]},"reports");
  let offset=0,chunks=[];do{const r=await getScreenshot(config,{reportId:"owned-report",offsetBytes:offset,maxBytes:8191,expectedHash:hash});chunks.push(Buffer.from(r.content64,"base64"));offset=r.nextOffsetBytes;assert.equal(r.sha256,hash);assert.equal(r.totalBytes,image.length);}while(offset!==null);
  assert.deepEqual(Buffer.concat(chunks),image);
  for(const payload of [{sampleIndex:-1},{offsetBytes:-1},{maxBytes:262145},{expectedHash:"wrong"}])await assert.rejects(getScreenshot(config,{reportId:"owned-report",...payload}));
  await fs.writeFile(file,"changed");await assert.rejects(getScreenshot(config,{reportId:"owned-report"}),/artifact_changed/);
  const outside=path.join(root,"outside.png");await fs.writeFile(outside,image);await fs.unlink(file);await fs.symlink(outside,file);
  await assert.rejects(getScreenshot(config,{reportId:"owned-report"}),/outside_artifacts/);
  assert.equal(requiredScope("tunnelWorkScreenshotGet"),"tunnel.read");
  const p=buildFsPayload({$_POST:{action:"tunnelWorkScreenshotGet",params:{reportId:"owned-report",sampleIndex:0,offsetBytes:8191,maxBytes:8191,expectedHash:hash}}});assert.equal(p.offsetBytes,8191);assert.equal(p.reportId,"owned-report");
 }finally{await fs.rm(root,{recursive:true,force:true});}
});
