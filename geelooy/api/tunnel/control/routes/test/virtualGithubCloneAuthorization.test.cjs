//B"H
//Boruch Hashem
//Blessed is He

"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const {buildFsPayload}=require("../../core/tunnelPayload.js");
const {osFs,gitImportAllowed}=require("../osFs.js");
const {requiredScope}=require("../../core/tunnelPayload/scope.js");

const repository="https://github.com/octocat/Hello-World";
test("POST JSON preserves GitHub import URL, ref and destination across the real payload builder",()=>{
	const request={request:{method:"POST",headers:{},body:{action:"gitClone",url:repository,ref:"master",destination:"project/examples/hello"}}};
	const result=buildFsPayload(request);
	assert.equal(result.action,"gitClone");
	assert.equal(result.url,repository);
	assert.equal(result.ref,"master");
	assert.equal(result.destination,"project/examples/hello");
	assert.equal(requiredScope(result.action),"tunnel.write");
	const other=buildFsPayload({request:{method:"POST",headers:{},body:{action:"read",url:repository,path:"project/example.txt"}}});
	assert.equal(other.url,undefined);
});
test("GitHub import refuses read-only and session credentials even if generic OS writes allow sessions",()=>{
	assert.equal(gitImportAllowed({kind:"session",scopes:["tunnel.write","tunnel.admin"]}),false);
	assert.equal(gitImportAllowed({kind:"apiKey",scopes:["tunnel.read"]}),false);
	assert.equal(gitImportAllowed({kind:"apiKey",scopes:["tunnel.write"]}),true);
	assert.equal(gitImportAllowed({kind:"oauth",scopes:["tunnel.admin"]}),true);
});
test("real OS route denies signed-in session gitClone before dispatch or network",async()=>{
	const vessel={request:{method:"POST",headers:{},body:{action:"gitClone",url:repository,ref:"master",destination:"project/examples/hello"},user:{info:{userId:"fixture-account"}}}};
	const result=await osFs(vessel);
	const content=typeof result==="string"?JSON.parse(result):result;
	assert.equal(content.ok,false);
	assert.equal(content.error,"git_import_requires_scoped_write_credential");
	assert.equal(content.neededScope,"tunnel.write");
});
