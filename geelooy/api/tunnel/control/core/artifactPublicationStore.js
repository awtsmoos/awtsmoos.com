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
const MAX_BYTES=128*1024*1024;
const CHUNK_BYTES=1024*1024;
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
/**
 * Transfer into controller-owned binary storage incrementally. Only one small
 * base64-encoded device relay chunk is resident at a time; the resulting URL
 * serves raw bytes and does not depend on the device remaining connected.
 * The source proof is checked again against the final file digest. Files whose
 * source changes mid-copy are rejected and deleted, never published.
 */
async function createFromVerifiedChunks({owner,requester="",path:sourcePath,expectedBytes,expectedSha256,readChunk,ttlSeconds=600,allowDownload=true,mimeType}={}) {
	cleanupExpired(100);
	if(!String(owner||"").trim())throw new Error("artifact_owner_required");
	if(!Number.isSafeInteger(expectedBytes)||expectedBytes<1||expectedBytes>MAX_BYTES)throw new Error("artifact_bytes_out_of_bounds");
	if(!/^[0-9a-f]{64}$/i.test(String(expectedSha256||"")))throw new Error("artifact_source_digest_invalid");
	if(typeof readChunk!=="function")throw new Error("artifact_chunk_reader_required");
	const token=crypto.randomBytes(32).toString("hex"),names=filenames(token);
	const basename=path.basename(String(sourcePath||"artifact.bin")).replace(/[^a-zA-Z0-9._-]/g,"_").slice(0,110)||"artifact.bin";
	const now=Date.now(),hash=crypto.createHash("sha256");
	let fd,offset=0;
	try {
		fd=fs.openSync(names.data,"wx",0o600);
		while(offset<expectedBytes) {
			const fragment=await readChunk(offset,Math.min(CHUNK_BYTES,expectedBytes-offset));
			const encoded=String(fragment?.content64||"");
			if(!encoded||encoded.length>Math.ceil(CHUNK_BYTES/3)*4+4||
				!/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(encoded))throw Error("artifact_chunk_encoding_invalid");
			const bytes=Buffer.from(encoded,"base64");
			if(bytes.toString("base64")!==encoded)throw Error("artifact_chunk_encoding_not_canonical");
			if(fragment?.offset!==offset||fragment?.nextOffset!==offset+bytes.length||
				fragment?.returnedBytes!==bytes.length||bytes.length<1||
				bytes.length>CHUNK_BYTES||offset+bytes.length>expectedBytes)throw Error("artifact_chunk_cursor_invalid");
			if(crypto.createHash("sha256").update(bytes).digest("hex")!==fragment.sha256)throw Error("artifact_chunk_integrity_failed");
			const written=fs.writeSync(fd,bytes,0,bytes.length,offset);
			if(written!==bytes.length)throw Error("artifact_short_disk_write");
			hash.update(bytes);offset+=bytes.length;
		}
		if(offset!==expectedBytes||hash.digest("hex")!==expectedSha256.toLowerCase())throw Error("artifact_whole_file_hash_mismatch");
		fs.fsyncSync(fd);fs.closeSync(fd);fd=undefined;
		const record={token,owner,sourcePath,requester,basename,createdAt:now,expiresAt:now+Math.max(30,Math.min(3600,Number(ttlSeconds)||600))*1000,sha256:expectedSha256.toLowerCase(),bytes:expectedBytes,mimeType:mimeFor(basename,mimeType),allowDownload:allowDownload!==false};
		fs.writeFileSync(names.meta,JSON.stringify(record),{flag:"wx",mode:0o600});
		return {artifactId:token,url:"https://awtsmoos.com/api/tunnel/control/artifact/"+token+"/"+encodeURIComponent(basename),expiresAt:record.expiresAt,sha256:record.sha256,bytes:record.bytes,mimeType:record.mimeType,allowDownload:record.allowDownload,transport:"verified-controller-binary",sourceTunnelEncoding:"chunked-base64"};
	} catch(error) {
		if(fd!==undefined)try{fs.closeSync(fd)}catch{}
		fs.rmSync(names.meta,{force:true});fs.rmSync(names.data,{force:true});
		throw error;
	}
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
module.exports={create,createFromVerifiedChunks,inspect,revoke,cleanupExpired,mimeFor,MAX_BYTES,CHUNK_BYTES};
