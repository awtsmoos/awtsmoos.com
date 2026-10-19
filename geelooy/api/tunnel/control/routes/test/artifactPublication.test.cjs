//B"H
//Boruch Hashem
//Blessed is He

"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const os=require("node:os");
const path=require("node:path");
const root=fs.mkdtempSync(path.join(os.tmpdir(),"awts-server-artifacts-"));
process.env.AWTSMOOS_ARTIFACT_STORAGE_ROOT=root;
const Store=require("../../core/artifactPublicationStore.js");
const Routes=require("../artifactPublication.js");
const {dataRoutes}=require("../routeGroups/dataRoutes.js");

test.after(()=>fs.rmSync(root,{recursive:true,force:true}));
test("controller stores binary once and serves after source Mac is unavailable",async()=>{
	const bytes=Buffer.from([137,80,78,71,13,10,26,10,1,2,3]);
	const published=Store.create({owner:"ownerA",body:bytes,path:"/owned/project/proof.png",ttlSeconds:600,allowDownload:false,requester:"test"});
	assert.match(published.artifactId,/^[0-9a-f]{64}$/);
	assert.match(published.url,/^https:\/\/awtsmoos.com\/api\/tunnel\/control\/artifact\//);
	const read=Store.inspect(published.artifactId);
	assert(read.buffer.equals(bytes));
	assert.equal(read.record.owner,"ownerA");
	assert.equal(read.record.allowDownload,false);
	const headers={},response={statusCode:200,headersSent:false,setHeader(k,v){headers[k]=v;}};
	const result=await Routes.artifactGet({request:{method:"GET"},response},{token:published.artifactId,filename:"proof.png"});
	assert(Buffer.isBuffer(result));
	assert(result.equals(bytes));
	assert.equal(headers["Content-Type"],"image/png");
	assert.equal(headers["Cache-Control"],"private, no-store, max-age=0");
	assert.equal(Store.revoke("ownerB",published.artifactId),false);
	assert.equal(Store.revoke("ownerA",published.artifactId),true);
	assert.equal(Store.inspect(published.artifactId),null);
});
test("expired or guessed tokens are rejected without revealing stored owner records",()=>{
	const p=Store.create({owner:"A",body:Buffer.from("abc"),path:"x.txt",ttlSeconds:30});
	assert.equal(Store.inspect("0".repeat(64)),null);
	assert.equal(Store.inspect("../"+p.artifactId),null);
	assert.equal(Store.inspect(p.artifactId,{now:Date.now()+60_000}),null);
	assert.equal(Store.inspect(p.artifactId).record.basename,"x.txt");
});
test("payload cap, empty and invalid owner fail closed",()=>{
	assert.throws(()=>Store.create({owner:"A",body:Buffer.alloc(0),path:"file"}),/bounds/);
	assert.throws(()=>Store.create({owner:"",body:Buffer.from("abc"),path:"file"}),/owner/);
	assert.throws(()=>Store.create({owner:"A",body:Buffer.alloc(Store.MAX_BYTES+1),path:"huge"}),/bounds/);
});
test("routing is explicit and unauthorized public upload never reaches file transport",async()=>{
	assert.equal(typeof dataRoutes["artifact/publish"],"function");
	assert.equal(typeof dataRoutes["artifact/revoke"],"function");
	assert.equal(typeof dataRoutes["artifact/:token/:filename"],"function");
	const context={request:{method:"POST",headers:{}},paramKinds:{POST:{path:"/etc/passwd",tunnelName:"other-account"}}};
	const result=await Routes.artifactPublish(context);
	const body=typeof result==="string"?JSON.parse(result):result;
	assert.equal(body.ok,false);
	assert.equal(body.error,"not_authenticated");
});

test("folder publication rejects traversal and limits request to exactly one file",()=>{
 assert.equal(Routes.resolvePublishedPath({root:"/tmp/owned",relativePath:"images/pic.png"}),"/tmp/owned/images/pic.png");
 assert.equal(Routes.resolvePublishedPath({root:"/tmp/owned",relativePath:"../../etc/shadow"}),"");
 assert.equal(Routes.resolvePublishedPath({root:"/tmp/owned",relativePath:"/etc/passwd"}),"");
 assert.equal(typeof dataRoutes["artifact/publish-folder-file"],"function");
});

test("expired controller artifact bytes are physically removed by bounded cleanup",()=>{
 const created=Store.create({owner:"cleanup-owner",body:Buffer.from("once"),path:"sample.log",ttlSeconds:60});
 const meta=path.join(root,created.artifactId+".json");
 const record=JSON.parse(fs.readFileSync(meta,"utf8"));record.expiresAt=Date.now()-1000;
 fs.writeFileSync(meta,JSON.stringify(record));
 assert(Store.cleanupExpired(100)>=1);
 assert.equal(Store.inspect(created.artifactId),null);
 assert.equal(fs.existsSync(path.join(root,created.artifactId+".bin")),false);
});

test("authenticated publication verifies chunks and persists a downloadable server artifact",async()=>{
 const Auth=require("../../core/auth.js");const Device=require("../deviceFileTransfer.js");
 const originalAuth=Auth.currentIdentity,originalSend=Device.send;
 const payload=Buffer.from("B\"H binary artifact from controlled fixture");
 const digest=require("node:crypto").createHash("sha256").update(payload).digest("hex");
 const calls=[];
 Auth.currentIdentity=()=>({ok:true,accountId:"reviewer-owned-test",userId:"reviewer-owned-test",scopes:["tunnel.admin"],clientId:"fixture-client",kind:"session"});
 Device.send=async(ctx,who,route,action,permission,args)=>{
   calls.push({route,action,permission});
   assert.equal(route,"tun_fixture");assert.equal(permission,"tunnel.read");
   if(action==="fileTransferSourceProof")return {totalBytes:payload.length,sha256:digest};
   if(action==="fileTransferReadChunk")return {offset:args.offset,nextOffset:payload.length,returnedBytes:payload.length,sha256:digest,content64:payload.toString("base64")};
   throw Error("unknown_action");
 };
 try {
   const response={statusCode:200,headersSent:false,setHeader() {}};
   const x=await Routes.artifactPublish({request:{method:"POST",headers:{}},paramKinds:{POST:{routeReference:"tun_fixture",path:"reports/image.png",ttlSeconds:600,allowDownload:true}},response});
   const receipt=typeof x==="string"?JSON.parse(x):x;
   assert.equal(receipt.ok,true,JSON.stringify(receipt));
   assert.equal(receipt.stage,"complete");
   assert.equal(calls.length,2);
   assert(Store.inspect(receipt.artifactId).buffer.equals(payload));
   assert.equal(Store.revoke("reviewer-owned-test",receipt.artifactId),true);
 } finally{Auth.currentIdentity=originalAuth;Device.send=originalSend;}
});


test("bounded rotating expiry cleanup eventually visits metadata past an initial page of live artifacts",()=>{
 const fs=require("node:fs"),path=require("node:path");
 const active=[];
 for(let i=0;i<140;i++)active.push(Store.create({owner:"rotation",body:Buffer.from("fixture "+i),path:"item.txt",ttlSeconds:120}));
 const expired=Store.create({owner:"rotation",body:Buffer.from("expired"),path:"expired.txt",ttlSeconds:60});
 const recordPath=path.join(root,expired.artifactId+".json"),record=JSON.parse(fs.readFileSync(recordPath,"utf8"));
 record.expiresAt=Date.now()-1;fs.writeFileSync(recordPath,JSON.stringify(record));
 let cleared=0;
 for(let i=0;i<10;i++)cleared+=Store.cleanupExpired(1);
 assert(cleared>=1,"rotating cursor must reach expired artifact");
 assert.equal(Store.inspect(expired.artifactId),null);
 for(const item of active)Store.revoke("rotation",item.artifactId);
});


test("any authorized file type gets correct binary MIME without altering bytes",()=>{
 const kinds=[["document.pdf","application/pdf"],["archive.zip","application/zip"],["recording.mp3","audio/mpeg"],["movie.mp4","video/mp4"],["world.glb","model/gltf-binary"],["unknown.data","application/octet-stream"]];
 for(const [name,mime] of kinds){
  const original=Buffer.from([0,255,128,1,42]);
  const pub=Store.create({owner:"any-file",body:original,path:name});
  assert.equal(pub.mimeType,mime,name);assert(Store.inspect(pub.artifactId).buffer.equals(original));
  assert.equal(Store.revoke("any-file",pub.artifactId),true);
 }
});
