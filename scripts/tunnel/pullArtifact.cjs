//B"H
//Boruch Hashem
//Blessed is He

"use strict";
const fs=require("node:fs");
const path=require("node:path");
const crypto=require("node:crypto");
const {pipeline}=require("node:stream/promises");
const {Readable,Transform}=require("node:stream");

/** Verified artifact ingestion, executed on the receiving AI's own computer.
 *  Does not depend on any image package or the source Mac being online.
 */
async function pullArtifact({url,sha256,destDir,maxBytes=16*1024*1024,fetchImpl=fetch}={}) {
	const location=new URL(String(url||""));
	if(location.protocol!=="https:"||location.hostname!=="awtsmoos.com"||
		!/^\/api\/tunnel\/control\/artifact\/[a-f0-9]{64}\/[a-zA-Z0-9._%-]+$/.test(location.pathname)) {
		throw Error("untrusted_artifact_url");
	}
	if(!/^[a-f0-9]{64}$/i.test(String(sha256||"")))throw Error("expected_sha256_required");
	if(!destDir||!path.isAbsolute(destDir))throw Error("absolute_destination_required");
	const response=await fetchImpl(url,{redirect:"error",signal:AbortSignal.timeout(15000)});
	if(!response.ok||!response.body)throw Error("artifact_fetch_failed:"+response.status);
	const folder=path.resolve(destDir);
	await fs.promises.mkdir(folder,{recursive:true,mode:0o700});
	const extension=(location.pathname.split("/").pop()||"file").replace(/[^a-zA-Z0-9._-]/g,"").slice(-30);
	const destination=path.join(folder,String(sha256).toLowerCase()+"-"+extension);
	const temporary=destination+".part-"+process.pid+"-"+crypto.randomBytes(4).toString("hex");
	const hasher=crypto.createHash("sha256");
	let bytes=0;
	const meter=new Transform({transform(chunk,encoding,callback){
		bytes+=chunk.length;
		if(bytes>maxBytes)return callback(new Error("artifact_max_bytes_exceeded"));
		hasher.update(chunk);callback(null,chunk);
	}});
	try {
		await pipeline(Readable.fromWeb(response.body),meter,fs.createWriteStream(temporary,{flags:"wx",mode:0o600}));
		const actual=hasher.digest("hex");
		if(actual!==String(sha256).toLowerCase())throw Error("artifact_hash_mismatch");
		await fs.promises.rename(temporary,destination);
		return {ok:true,path:destination,bytes,sha256:actual};
	}catch(error){await fs.promises.rm(temporary,{force:true});throw error;}
}

if(require.main===module){
	const [url,expected,directory]=process.argv.slice(2);
	pullArtifact({url,sha256:expected,destDir:directory}).then(value=>console.log(JSON.stringify(value)),
	error=>{console.error(JSON.stringify({ok:false,error:error.message}));process.exitCode=1;});
}
module.exports={pullArtifact};
