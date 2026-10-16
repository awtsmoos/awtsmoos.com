//B"H
//Boruch Hashem
//Blessed is He

"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const crypto=require("node:crypto");
const fs=require("node:fs");
const os=require("node:os");
const path=require("node:path");
const {pullArtifact}=require("./pullArtifact.cjs");
const token="a".repeat(64),url="https://awtsmoos.com/api/tunnel/control/artifact/"+token+"/proof.png";
const binary=Buffer.from([137,80,78,71,13,10,26,10,5,6,7,8]);
const sha256=crypto.createHash("sha256").update(binary).digest("hex");
test("AI-side pull stores verified actual bytes without returning base64",async()=>{
	const dir=fs.mkdtempSync(path.join(os.tmpdir(),"awt-pull-"));
	try {
		const x=await pullArtifact({url,sha256,destDir:dir,fetchImpl:async()=>new Response(binary,{status:200})});
		assert.equal(x.ok,true);
		assert.equal(x.sha256,sha256);
		assert.deepEqual(fs.readFileSync(x.path),binary);
		assert(!JSON.stringify(x).includes(binary.toString("base64")));
	}finally{fs.rmSync(dir,{recursive:true,force:true});}
});
test("untrusted artifact URLs, tampered bytes and redirects cannot write a file",async()=>{
	const dir=fs.mkdtempSync(path.join(os.tmpdir(),"awt-pull-deny-"));
	try {
		await assert.rejects(pullArtifact({url:"https://example.com/file",sha256,destDir:dir}),/untrusted/);
		await assert.rejects(pullArtifact({url,sha256:"b".repeat(64),destDir:dir,fetchImpl:async()=>new Response(binary)}),/hash_mismatch/);
		assert.deepEqual(fs.readdirSync(dir),[]);
	}finally{fs.rmSync(dir,{recursive:true,force:true});}
});
