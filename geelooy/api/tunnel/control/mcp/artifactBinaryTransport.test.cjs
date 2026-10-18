// B"H
"use strict";
const test=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),os=require("node:os"),path=require("node:path"),crypto=require("node:crypto");
const root=fs.mkdtempSync(path.join(os.tmpdir(),"awts-binary-"));
process.env.AWTSMOOS_ARTIFACT_STORAGE_ROOT=root;
const Store=require("../core/artifactPublicationStore.js"),Routes=require("../routes/artifactPublication.js"),Protocol=require("./protocol.js");
const Auth=require("../core/auth.js"),Device=require("../routes/deviceFileTransfer.js");
const sha=x=>crypto.createHash("sha256").update(x).digest("hex");
test.after(()=>fs.rmSync(root,{recursive:true,force:true}));
test("5 MiB original is copied in bounded chunks with identical SHA-256 and durable 0600 bytes",async()=>{
 const original=crypto.randomBytes(Store.CHUNK_BYTES*4+31837);let n=0;
 const meta=await Store.createFromVerifiedChunks({owner:"owner",path:"shots/original.png",
  expectedBytes:original.length,expectedSha256:sha(original),readChunk:async(offset,maxBytes)=>{
   const body=original.subarray(offset,offset+Math.min(maxBytes,37011));n++;
   return {offset,nextOffset:offset+body.length,returnedBytes:body.length,content64:body.toString("base64"),sha256:sha(body)};
  },ttlSeconds:45});
 assert(n>100);assert.equal(meta.sha256,sha(original));assert.equal(meta.bytes,original.length);
 assert.equal(meta.transport,"verified-controller-binary");assert.equal(meta.sourceTunnelEncoding,"chunked-base64");
 assert(Store.inspect(meta.artifactId).buffer.equals(original));
 assert.equal(fs.statSync(path.join(root,meta.artifactId+".bin")).mode&0o777,0o600);
 assert.equal(Store.revoke("owner",meta.artifactId),true);assert.equal(Store.inspect(meta.artifactId),null);
});
test("tampered SHA, wrong cursors, invalid Base64 and final mismatches clean up partial disk state",async()=>{
 const original=Buffer.from("B'H known deterministic file");
 const cases=[
  {kind:"wrong_cursor",mutate:x=>({...x,nextOffset:x.nextOffset+1}),re:/cursor/},
  {kind:"bad_hash",mutate:x=>({...x,sha256:"0".repeat(64)}),re:/integrity/},
  {kind:"noncanonical",mutate:x=>({...x,content64:x.content64.replace(/=+$/,"")}),re:/encoding/},
  {kind:"wrong_whole_file",mutate:x=>x,whole:"0".repeat(64),re:/whole_file_hash/}
 ];
 for(const c of cases){const before=fs.readdirSync(root).sort();
  await assert.rejects(Store.createFromVerifiedChunks({owner:"owner",path:"a.bin",expectedBytes:original.length,
   expectedSha256:c.whole||sha(original),readChunk:async(offset,maxBytes)=>{
    const b=original.subarray(offset,offset+maxBytes);
    return c.mutate({offset,nextOffset:offset+b.length,returnedBytes:b.length,content64:b.toString("base64"),sha256:sha(b)});
   }}),c.re,c.kind);
  assert.deepEqual(fs.readdirSync(root).sort(),before,c.kind);
 }
 await assert.rejects(Store.createFromVerifiedChunks({owner:"owner",expectedBytes:Store.MAX_BYTES+1,expectedSha256:"0".repeat(64),readChunk:()=>{throw Error("unreachable")}}),/bounds/);
});
test("HTTPS artifact handler returns GET bytes, HEAD, byte range, suffix, 416 and revocation",async()=>{
 const bytes=crypto.randomBytes(4099),pub=Store.create({owner:"me",path:"screenshot.png",body:bytes,ttlSeconds:60});
 async function request(method,range){const headers={},response={statusCode:200,headersSent:false,setHeader:(k,v)=>headers[k]=v};
  const value=await Routes.artifactGet({request:{method,headers:range?{range}:{}},response},{token:pub.artifactId});
  return {value,headers,status:response.statusCode};
 }
 const full=await request("GET");assert.equal(full.status,200);assert(full.value.equals(bytes));
 assert.equal(full.headers["Content-Length"],bytes.length);assert.equal(full.headers["ETag"],'"'+sha(bytes)+'"');
 assert.equal(full.headers["Accept-Ranges"],"bytes");
 const head=await request("HEAD");assert.equal(head.status,200);assert.equal(head.value.length,0);
 assert.equal(head.headers["Content-Length"],bytes.length);
 const part=await request("GET","bytes=1024-2047");assert.equal(part.status,206);assert(part.value.equals(bytes.subarray(1024,2048)));
 assert.equal(part.headers["Content-Range"],"bytes 1024-2047/4099");
 assert((await request("GET","bytes=2048-")).value.equals(bytes.subarray(2048)));
 assert((await request("GET","bytes=-12")).value.equals(bytes.subarray(bytes.length-12)));
 for(const v of ["bytes=5000-6000","bytes=0-1,4-5"]){const bad=await request("GET",v);assert.equal(bad.status,416);assert.equal(bad.value.length,0);}
 assert.equal(Store.revoke("not-owner",pub.artifactId),false);assert.equal(Store.revoke("me",pub.artifactId),true);
 assert.equal(Store.inspect(pub.artifactId),null);
});
test("consent-gated successful MCP publishing yields real resource_link metadata but does not claim host import",async()=>{
 const bytes=crypto.randomBytes(44),identity={ok:true,accountId:"approved",userId:"approved",scopes:["tunnel.read","tunnel.admin"]};
 const oldAuth=Auth.currentIdentity,oldSend=Device.send;Auth.currentIdentity=()=>identity;
 Device.send=async(_ctx,_identity,route,action,_scope,params)=>{
  assert.equal(route,"approved-route");
  if(action==="fileTransferSourceProof")return {totalBytes:bytes.length,sha256:sha(bytes)};
  if(action==="fileTransferReadChunk")return {offset:params.offset,nextOffset:bytes.length,returnedBytes:bytes.length,content64:bytes.toString("base64"),sha256:sha(bytes)};
  throw Error("unexpected");};
 try{
 const result=await Protocol.dispatch({request:{method:"POST"}},identity,{method:"tools/call",params:{name:"awtsmoos_artifact_publish",arguments:{
  routeReference:"approved-route",path:"test.png",confirmPublicSharing:true,ttlSeconds:30}}});
 assert.equal(result.structuredContent.ok,true,JSON.stringify(result));
 assert.equal(result.structuredContent.hostImportConfirmed,false);
 const links=result.content.filter(x=>x.type==="resource_link");assert.equal(links.length,1);
 assert.equal(links[0].uri,result.structuredContent.url);assert.equal(links[0].size,bytes.length);assert.equal(links[0].mimeType,"image/png");
 assert.match(links[0].description,/SHA-256/);
 assert(Store.inspect(result.structuredContent.artifactId).buffer.equals(bytes));
 assert.equal(Store.revoke("approved",result.structuredContent.artifactId),true);
 }finally{Auth.currentIdentity=oldAuth;Device.send=oldSend;}
});
