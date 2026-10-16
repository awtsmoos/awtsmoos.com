//B"H
//Boruch Hashem
//Blessed is He

"use strict";
const crypto = require("node:crypto");
const fs = require("node:fs/promises");
const path = require("node:path");

function artifactDir(root) { return path.join(root,".awtsmoos","chrome","artifacts"); }
function operationKey(id) { return crypto.createHash("sha256").update(String(id)).digest("hex"); }
/** Read a completed request receipt instead of recapturing after reconnect. */
async function committed(root, requestId, fingerprint, ttlMs = 900000) {
	if (!requestId) return null;
	try {
		const file = path.join(artifactDir(root), "request-"+operationKey(requestId)+".json");
		const receipt = JSON.parse(await fs.readFile(file,"utf8"));
		if (receipt.fingerprint !== fingerprint) throw new Error("request_id_payload_mismatch");
		if (Date.now()-Date.parse(receipt.createdAt)>ttlMs) return null;
		if ((await fs.stat(receipt.artifact.path)).size !== receipt.artifact.bytes) return null;
		return {...receipt.result,cached:true};
	} catch(error) {if(error.code === "ENOENT")return null;throw error;}
}
/** Content-addressed private artifact with SHA-256 and transfer metadata. */
async function saveArtifact(root,binary,{mimeType="image/png",metadata={},requestId,fingerprint}={}) {
	const bytes = Buffer.isBuffer(binary) ? binary : Buffer.from(binary);
	if (!bytes.length || bytes.length>24*1024*1024)throw new Error("artifact_size_out_of_bounds");
	const sha256=crypto.createHash("sha256").update(bytes).digest("hex");
	const directory=artifactDir(root);
	await fs.mkdir(directory,{recursive:true,mode:0o700});
	const ext=({"image/png":"png","image/jpeg":"jpg","image/webp":"webp"})[mimeType];
	if(!ext)throw new Error("artifact_mime_not_supported");
	const file=path.join(directory,sha256+"."+ext);
	await fs.writeFile(file,bytes,{flag:"wx",mode:0o600}).catch(error=>{if(error.code!=="EEXIST")throw error;});
	const artifact={artifactId:sha256,path:file,sha256,bytes:bytes.length,mimeType,createdAt:new Date().toISOString(),transfer:{path:file,sha256,totalBytes:bytes.length}};
	const result={ok:true,artifact,metadata};
	if(requestId){
		const receipt={fingerprint,createdAt:new Date().toISOString(),artifact,result};
		const destination=path.join(directory,"request-"+operationKey(requestId)+".json");
		const temporary=destination+".tmp-"+process.pid+"-"+crypto.randomBytes(4).toString("hex");
		await fs.writeFile(temporary,JSON.stringify(receipt),{mode:0o600});
		await fs.rename(temporary,destination);
	}
	return result;
}
module.exports={artifactDir,operationKey,committed,saveArtifact};
