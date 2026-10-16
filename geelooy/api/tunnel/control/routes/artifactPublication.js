//B"H
//Boruch Hashem
//Blessed is He

"use strict";
const crypto=require("node:crypto");
const path=require("node:path");
const Auth=require("../core/auth.js");
const {scopeAllowed}=require("../core/apiKeyStore.js");
const {json}=require("../core/respond.js");
const Store=require("../core/artifactPublicationStore.js");
const Device=require("./deviceFileTransfer.js");

/** Explicit authenticated file publication. Native transfer confines paths to
 *  the device project root; external paths need a separate owner-grant feature.
 */
async function artifactPublish($i) {
	const who=Auth.currentIdentity($i);
	if(!who.ok)return json($i,{ok:false,error:"not_authenticated"},401);
	if(!scopeAllowed(who,"tunnel.admin"))return json($i,{ok:false,error:"admin_publication_scope_required"},403);
	if(String($i.request?.method||"GET").toUpperCase()!=="POST")return json($i,{ok:false,error:"post_required"},405);
	const input={...($i.paramKinds?.POST||$i.$_POST||{})},route=String(input.routeReference||input.tunnelName||"");
	const source=resolvePublishedPath(input);
	if(!route||!source)return json($i,{ok:false,error:"route_and_explicit_file_required"},400);
	let stage="source_proof";
	try{
		const send=(action,args)=>Device.send($i,who,route,action,"tunnel.read",args);
		const proof=await send("fileTransferSourceProof",{path:source});
		if(!proof?.sha256||!Number.isInteger(proof.totalBytes)||proof.totalBytes<=0||proof.totalBytes>Store.MAX_BYTES)throw Error("file_size_or_proof_invalid");
		stage="device_transfer";
		let offset=0;
		const blocks=[];
		while(offset<proof.totalBytes){
			const fragment=await send("fileTransferReadChunk",{path:source,offset,maxBytes:1024*1024});
			if(fragment.offset!==offset||fragment.nextOffset<=offset)throw Error("artifact_chunk_cursor_invalid");
			const bytes=Buffer.from(String(fragment.content64||""),"base64");
			const sha256=crypto.createHash("sha256").update(bytes).digest("hex");
			if(sha256!==fragment.sha256||bytes.length!==fragment.returnedBytes)throw Error("artifact_chunk_integrity_failed");
			blocks.push(bytes);offset=fragment.nextOffset;
		}
		const content=Buffer.concat(blocks);
		if(content.length!==proof.totalBytes||crypto.createHash("sha256").update(content).digest("hex")!==proof.sha256)throw Error("artifact_whole_file_hash_mismatch");
		stage="controller_storage";
		const descriptor=Store.create({owner:who.accountId,requester:who.clientId||who.userId,path:source,body:content,ttlSeconds:input.ttlSeconds,allowDownload:input.allowDownload,mimeType:input.mimeType});
		return json($i,{ok:true,stage:"complete",...descriptor},201);
	}catch(error){return json($i,{ok:false,error:error.message,stage},502);}
}

/** Restrict a folder request to one named file; never reveal its siblings. */
function resolvePublishedPath(input={}) {
	if (input.relativePath !== undefined) {
		const rel=String(input.relativePath||"");
		const root=String(input.root||"");
		if(!rel||!root||path.isAbsolute(rel)||rel.split(/[\\/]/).includes("..")||rel.includes("\0"))return "";
		return path.join(root,rel);
	}
	const source=String(input.path||input.sourcePath||"");
	return source&&!source.includes("\0") ? source : "";
}

/** Public only to someone possessing this 256-bit URL; no live Mac involved. */
async function artifactGet($i,variables={}) {
	if(String($i.request?.method||"GET").toUpperCase()!=="GET")return json($i,{ok:false,error:"get_required"},405);
	const record=Store.inspect(String(variables.token||""));
	if(!record)return json($i,{ok:false,error:"artifact_unknown_or_expired"},404);
	const response=$i.response||$i.res;
	if(response&&!response.headersSent){
		response.statusCode=200;
		response.setHeader("Content-Type",record.record.mimeType);
		response.setHeader("Cache-Control","private, no-store, max-age=0");
		response.setHeader("X-Content-Type-Options","nosniff");
		response.setHeader("Referrer-Policy","no-referrer");
		response.setHeader("Content-Security-Policy","default-src 'none'");
		response.setHeader("Content-Disposition",(record.record.allowDownload?"attachment":"inline")+'; filename="'+record.record.basename+'"');
	}
	return record.buffer;
}

async function artifactRevoke($i) {
	const who=Auth.currentIdentity($i);
	if(!who.ok)return json($i,{ok:false,error:"not_authenticated"},401);
	if(!scopeAllowed(who,"tunnel.admin"))return json($i,{ok:false,error:"admin_publication_scope_required"},403);
	if(String($i.request?.method||"GET").toUpperCase()!=="POST")return json($i,{ok:false,error:"post_required"},405);
	const params=$i.paramKinds?.POST||$i.$_POST||{};
	const revoked=Store.revoke(who.accountId,String(params.artifactId||params.token||""));
	return json($i,{ok:revoked,revoked},revoked?200:404);
}
module.exports={artifactPublish,artifactGet,artifactRevoke,resolvePublishedPath};
