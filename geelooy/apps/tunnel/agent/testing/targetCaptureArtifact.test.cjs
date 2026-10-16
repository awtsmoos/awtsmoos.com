//B"H
//Boruch Hashem
//Blessed is He

"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const os=require("node:os");
const path=require("node:path");
const {captureBrowserTarget}=require("../tools/chrome/targetCapture.js");
const {transformImage}=require("../tools/chrome/nativeImageTransform.js");

const PNG=Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+XGZsAAAAASUVORK5CYII=","base64");
function context() {
	const root=fs.mkdtempSync(path.join(os.tmpdir(),"awts-capture-"));
	const target={id:"ABCDEF012345",type:"page",url:"https://example.test/capture",title:"Proof",webSocketDebuggerUrl:"ws://127.0.0.1:9222/devtools/page/ABCDEF012345"};
	let calls=[];
	const session={async call(method,params){calls.push(method);if(method==="Page.captureScreenshot")return {data:PNG.toString("base64")};if(method==="Runtime.evaluate")return {result:{value:"complete"}};return {}},close(){}};
	const deps={root,config:{root,chrome:{enabled:true},tools:{chrome:true,fsRead:true}},pages:async()=>[target],connectTarget:async()=>session};
	return {root,deps,calls,cleanup(){fs.rmSync(root,{recursive:true,force:true})}};
}
test("explicit 1170x2532 target creates real binary artifact with provenance, not frame64",async()=>{
	const c=context();
	try{
		const result=await captureBrowserTarget({targetId:"ABCDEF012345",viewport:{width:1170,height:2532},requestId:"shotA"},c.deps);
		assert.equal(result.ok,true,JSON.stringify(result));
		assert.equal(result.metadata.targetId,"ABCDEF012345");
		assert.deepEqual(result.metadata.viewport,{width:1170,height:2532});
		assert.equal(result.artifact.bytes,PNG.length);
		assert(fs.readFileSync(result.artifact.path).equals(PNG));
		assert(!JSON.stringify(result).includes(PNG.toString("base64")));
		assert(c.calls.includes("Page.captureScreenshot"));
		const second=await captureBrowserTarget({targetId:"ABCDEF012345",viewport:{width:1170,height:2532},requestId:"shotA"},c.deps);
		assert.equal(second.cached,true);
		assert.equal(c.calls.filter(x=>x==="Page.captureScreenshot").length,1);
	}finally{c.cleanup();}
});
test("missing and mismatched target fails closed instead of foreground capture",async()=>{
	const c=context();
	try{
		const miss=await captureBrowserTarget({targetId:"MISSING012345"},c.deps);
		assert.equal(miss.ok,false);
		assert.equal(miss.error,"target_not_found");
		assert(!c.calls.includes("Page.captureScreenshot"));
	}finally{c.cleanup();}
});
test("idempotency ID binds exact viewport and rejects accidental reuse",async()=>{
	const c=context();
	try{
		const first=await captureBrowserTarget({targetId:"ABCDEF012345",requestId:"same-id"},c.deps);
		assert.equal(first.ok,true);
		const bad=await captureBrowserTarget({targetId:"ABCDEF012345",viewport:{width:390,height:844},requestId:"same-id"},c.deps);
		assert.equal(bad.ok,false);
		assert.equal(bad.error,"request_id_payload_mismatch");
	}finally{c.cleanup();}
});
test("deadline failure reports execution stage without retry loops",async()=>{
	const c=context();
	try{
		c.deps.connectTarget=async()=>new Promise(resolve=>setTimeout(()=>resolve({call:()=>null,close(){}}),6000));
		const start=Date.now();
		const out=await captureBrowserTarget({targetId:"ABCDEF012345",budgetMs:1000},c.deps);
		assert.equal(out.ok,false);
		assert.equal(out.error,"lightweight_budget_exceeded");
		assert(Date.now()-start<1800);
	}finally{c.cleanup();}
});
test("conversion requires guarded file and a browser-native runtime",async()=>{
	const c=context();
	try{
		const denied=await transformImage({file:"/etc/passwd",format:"png"},c.deps);
		assert.equal(denied.ok,false);
		assert.match(denied.error,/outside|root/);
		const src=path.join(c.root,"image.png");
		fs.writeFileSync(src,PNG);
		c.deps.connectTarget=async()=>({async call(method){assert.equal(method,"Runtime.evaluate");return {result:{value:{base64:PNG.toString("base64"),width:200,height:400}}}},close(){}});
		const out=await transformImage({file:src,width:200,height:400,format:"png"},c.deps);
		assert.equal(out.ok,true,JSON.stringify(out));
		assert.equal(out.metadata.width,200);
		assert(fs.readFileSync(out.artifact.path).equals(PNG));
	}finally{c.cleanup();}
});
