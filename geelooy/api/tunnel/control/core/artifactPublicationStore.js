//B"H
//Boruch Hashem
//Blessed is He

"use strict";
const fs=require("node:fs");
const path=require("node:path");
const os=require("node:os");
const crypto=require("node:crypto");

const ROOT=process.env.AWTSMOOS_ARTIFACT_STORAGE_ROOT||path.join(os.homedir(),".awtsmoos-private","published-artifacts");
const TOKEN_RE=/^[0-9a-f]{64}$/;
const MAX_BYTES=16*1024*1024;
/** Controller-local durable private store; a link survives a Mac disconnect. */
function storageRoot() {fs.mkdirSync(ROOT,{recursive:true,mode:0o700});return ROOT;}
function filenames(token) {if(!TOKEN_RE.test(String(token||"")))throw new Error("invalid_artifact_token");const base=path.join(storageRoot(),token);return {data:base+".bin",meta:base+".json"};}
function mimeFor(name,override) {
	const types={png:"image/png",jpg:"image/jpeg",jpeg:"image/jpeg",webp:"image/webp",gif:"image/gif",pdf:"application/pdf",txt:"text/plain; charset=utf-8",json:"application/json",log:"text/plain; charset=utf-8"};
	const fallback=types[path.extname(name).slice(1).toLowerCase()]||"application/octet-stream";
	return /^(image\/(png|jpeg|webp|gif)|application\/(pdf|json|octet-stream)|text\/plain)(; charset=utf-8)?$/.test(String(override||"")) ? override : fallback;
}
function create({owner,body,path:sourcePath,ttlSeconds=600,allowDownload=true,mimeType,requester=""}={}) {
	cleanupExpired(100);
	if(!String(owner||"").trim())throw new Error("artifact_owner_required");
	if(!Buffer.isBuffer(body)||body.length===0||body.length>MAX_BYTES)throw new Error("artifact_bytes_out_of_bounds");
	const ttl=Math.max(30,Math.min(3600,Number(ttlSeconds)||600));
	const token=crypto.randomBytes(32).toString("hex"),names=filenames(token);
	const basename=path.basename(String(sourcePath||"artifact.bin")).replace(/[^a-zA-Z0-9._-]/g,"_").slice(0,110)||"artifact.bin";
	const now=Date.now(),record={token,owner,sourcePath,requester,basename,createdAt:now,expiresAt:now+ttl*1000,sha256:crypto.createHash("sha256").update(body).digest("hex"),bytes:body.length,mimeType:mimeFor(basename,mimeType),allowDownload:allowDownload!==false};
	fs.writeFileSync(names.data,body,{flag:"wx",mode:0o600});
	try{fs.writeFileSync(names.meta,JSON.stringify(record),{flag:"wx",mode:0o600});}catch(error){fs.rmSync(names.data,{force:true});throw error;}
	return {artifactId:token,url:"https://awtsmoos.com/api/tunnel/control/artifact/"+token+"/"+encodeURIComponent(basename),expiresAt:record.expiresAt,sha256:record.sha256,bytes:record.bytes,mimeType:record.mimeType,allowDownload:record.allowDownload};
}
function inspect(token,{bytes=true,now=Date.now()}={}) {
	let names,record;
	try{names=filenames(token);record=JSON.parse(fs.readFileSync(names.meta,"utf8"));}catch{return null;}
	if(record.token!==token||record.expiresAt<=now)return null;
	if(!bytes)return {record};
	try{
		const buffer=fs.readFileSync(names.data);
		if(buffer.length!==record.bytes||crypto.createHash("sha256").update(buffer).digest("hex")!==record.sha256)return null;
		return {record,buffer};
	}catch{return null;}
}
/** Bounded garbage collection so expired private files cannot grow forever. */
function cleanupExpired(limit=100,now=Date.now()) {
	let cleared=0;
	for(const name of fs.readdirSync(storageRoot()).filter(x=>TOKEN_RE.test(x.slice(0,-5))&&x.endsWith(".json")).slice(0,Math.max(1,limit))){
		const token=name.slice(0,-5),paths=filenames(token);
		try{
			const record=JSON.parse(fs.readFileSync(paths.meta,"utf8"));
			if(Number(record.expiresAt)>now)continue;
		}catch{}
		fs.rmSync(paths.meta,{force:true});fs.rmSync(paths.data,{force:true});cleared++;
	}
	return cleared;
}

function revoke(owner,token) {
	const found=inspect(token,{bytes:false});
	if(!found||found.record.owner!==owner)return false;
	const names=filenames(token);
	fs.rmSync(names.meta,{force:true});
	fs.rmSync(names.data,{force:true});
	return true;
}
module.exports={create,inspect,revoke,cleanupExpired,mimeFor,MAX_BYTES};
