//B"H
//Boruch Hashem
//Blessed is He

"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const zlib=require("node:zlib");
const {cloneSpecification}=require("../githubCloneSource.js");
const {parseGithubArchive}=require("../githubArchiveParser.js");
const {gitClone}=require("../githubCloneAction.js");
const {gitCloneStatus}=require("../githubCloneStatus.js");
const {dispatchOsFs}=require("../index.js");
const {createContext}=require("../../fsVessel/test/helpers/memoryHostedDb.cjs");
const {requiredScope}=require("../../../core/tunnelPayload/scope.js");

function tar(entries) {
	const sections=[];
	for(const file of entries) {
		const body=Buffer.isBuffer(file.content)?file.content:Buffer.from(file.content||"");
		const header=Buffer.alloc(512);
		const name=Buffer.from(file.path,"utf8");
		if(name.length>100)throw Error("fixture path too long");
		name.copy(header,0);
		const oct=(number,start,len)=>header.write(number.toString(8).padStart(len-1,"0")+"\0",start,len,"ascii");
		oct(0o644,100,8);oct(0,108,8);oct(0,116,8);oct(body.length,124,12);oct(0,136,12);
		header.fill(32,148,156);
		header[156]=(file.type||"0").charCodeAt(0);
		header.write("ustar",257,"ascii");
		let sum=0;for(const byte of header)sum+=byte;
		header.write(sum.toString(8).padStart(6,"0")+"\0 ",148,"ascii");
		sections.push(header,body,Buffer.alloc((512-body.length%512)%512));
	}
	sections.push(Buffer.alloc(1024));
	return zlib.gzipSync(Buffer.concat(sections));
}
const archive=tar([
	{path:"tiny-main/README.md",content:"# Tiny repository\n"},
	{path:"tiny-main/src/index.js",content:"export const answer = 42;\n"},
	{path:"tiny-main/docs/help.txt",content:"Helpful project guide\n"}
]);
const url="https://github.com/sampleowner/tiny";
function setup(ownership={alice:["project"]}) {
	const ctx=createContext(ownership);
	const dispatch=payload=>dispatchOsFs(ctx,"alice",payload);
	const clone=(payload,overrides={})=>gitClone(ctx,"alice",{url,destination:"project/repos/tiny",...payload},dispatch,{download:async()=>archive,...overrides});
	return {ctx,dispatch,clone};
}
test("GitHub URL and ref are strict public HTTPS, VFS alias is explicit",()=>{
	const x=cloneSpecification({url:"https://github.com/sampleowner/tiny.git",branch:"feature/cool",destination:"project/repos/tiny"});
	assert.equal(x.ref,"feature/cool");
	assert.match(x.archiveUrl,/codeload\.github\.com\/sampleowner\/tiny\/tar\.gz\/refs\/heads\/feature\/cool/);
	for(const bad of ["http://github.com/a/b","https://github.com/a/b?token=abc","https://github.com/a/b/tree/main","https://user:password@github.com/a/b","https://127.0.0.1/a/b","https://github.com/a/b#token"]) {
		assert.throws(()=>cloneSpecification({url:bad,destination:"project/repo"}),/GIT_CLONE_/);
	}
	assert.throws(()=>cloneSpecification({url,destination:"project/../secret"}),/virtual_os_path_escape_blocked/);
	assert.throws(()=>cloneSpecification({url,destination:"project/repo",ref:"../../etc"}),/INVALID_REF/);
	assert.equal(requiredScope("gitClone"),"tunnel.write");
});
test("tar.gz parser imports UTF-8 source and rejects symlinks, bombs and traversal",()=>{
	const snapshot=parseGithubArchive(archive);
	assert.equal(snapshot.files.length,3);
	assert.equal(snapshot.files[1].path,"src/index.js");
	assert.equal(snapshot.complete,true);
	assert.throws(()=>parseGithubArchive(tar([{path:"tiny-main/../../etc/shadow",content:"x"}])),/UNSAFE/);
	assert.throws(()=>parseGithubArchive(tar([{path:"tiny-main/link",type:"2",content:"../secret"}])),/UNSUPPORTED/);
	const corrupted=Buffer.from(archive);corrupted[corrupted.length-6]^=1;
	assert.throws(()=>parseGithubArchive(corrupted),/EXPANSION_LIMIT|GZIP/);
	const mixed=parseGithubArchive(tar([{path:"tiny-main/a.txt",content:"valid"},{path:"tiny-main/pic.png",content:Buffer.from([0,1,2])}]));
	assert.equal(mixed.complete,false);
	assert.deepEqual(mixed.skippedBinary,["pic.png"]);
});
test("real hosted dispatcher imports 3 files into owned VFS and saves source receipt",async()=>{
	const {clone,dispatch}=setup();
	const result=await clone();
	assert.equal(result.ok,true,JSON.stringify(result));
	assert.equal(result.filesImported,3);
	assert.equal(result.fullGitHistory,false);
	assert.equal(result.nativeShell,false);
	const got=await dispatch({action:"read",path:"project/repos/tiny/src/index.js"});
	assert.equal(got.content,"export const answer = 42;\n");
	const receipt=await dispatch({action:"read",path:"project/repos/tiny/.awtsmoos-clone.json"});
	assert.equal(JSON.parse(receipt.content).source,url);
	const repeated=await clone();
	assert.equal(repeated.ok,true);
	assert.equal(repeated.alreadyImported,true);
});
test("foreign user cannot start clone, even before a GitHub HTTP request",async()=>{
	const ctx=createContext({alice:["project"]});
	let downloads=0;
	const result=await gitClone(ctx,"mallory",{url,destination:"project/pwn"},p=>dispatchOsFs(ctx,"mallory",p),{download:async()=>{downloads++;return archive;}});
	assert.equal(result.ok,false);
	assert.equal(result.error,"alias_not_owned");
	assert.equal(downloads,0);
});
test("existing target is not overwritten and unsuccessful clones preserve precise stage",async()=>{
	const {clone,dispatch}=setup();
	const wrote=await dispatch({action:"write",path:"project/repos/tiny/readme.txt",content:"Mine"});
	assert.equal(wrote.ok,true);
	const result=await clone();
	assert.equal(result.ok,false);
	assert.equal(result.error,"GIT_CLONE_DESTINATION_NOT_EMPTY");
	assert.equal(result.stage,"authorized_destination");
	assert.equal((await dispatch({action:"read",path:"project/repos/tiny/readme.txt"})).content,"Mine");
});
test("pre-download expansion limit rejects oversized payload before any VFS writes",async()=>{
	const {clone,dispatch}=setup();
	const oversize=tar([{path:"tiny-main/huge.md",content:"A".repeat(310000)}]);
	const result=await clone({}, {download:async()=>oversize});
	assert.equal(result.ok,false);
	assert.match(result.error,/FILE_TOO_LARGE/);
	assert.equal(result.stage,"validating_archive");
	assert.deepEqual((await dispatch({action:"list",path:"project/repos/tiny"})).items,[]);
});

test("concurrent clones from one account are bounded and return a precise retry receipt",async()=>{
 const {clone}=setup();
 let release;const gate=new Promise(resolve=>{release=resolve;});
 let started;const commenced=new Promise(resolve=>{started=resolve;});
 const pending=clone({}, {download:async()=>{started();await gate;return archive;}});
 await commenced;
 const second=await clone({destination:"project/repos/another"});
 assert.equal(second.ok,false);
 assert.equal(second.error,"GIT_CLONE_OWNER_BUSY");
 release();
 assert.equal((await pending).ok,true);
});

test("read-only gitCloneStatus verifies owned import receipt without downloading GitHub again",async()=>{
 const {ctx,dispatch,clone}=setup();
 assert.equal((await clone()).ok,true);
 const meta=await gitCloneStatus(ctx,"alice",{path:"project/repos/tiny"},dispatch);
 assert.equal(meta.ok,true,JSON.stringify(meta));
 assert.equal(meta.action,"gitCloneStatus");
 assert.equal(meta.source,url);
 assert.equal(meta.filesImported,3);
 assert.equal(meta.fullGitHistory,false);
 assert.equal(meta.nativeShell,false);
 const missing=await gitCloneStatus(ctx,"alice",{path:"project/repos/missing"},dispatch);
 assert.equal(missing.ok,false);
 assert.equal(missing.error,"GIT_CLONE_NOT_IMPORTED");
 const foreign=await gitCloneStatus(ctx,"mallory",{path:"project/repos/tiny"},p=>dispatchOsFs(ctx,"mallory",p));
 assert.equal(foreign.ok,false);
 assert.equal(foreign.error,"alias_not_owned");
});
