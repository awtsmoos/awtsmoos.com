//B"H
//Boruch Hashem
//Blessed is He

"use strict";
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
		stage="verified_device_transfer_to_controller_disk";
		const descriptor=await Store.createFromVerifiedChunks({
			owner:who.accountId,requester:who.clientId||who.userId,path:source,
			expectedBytes:proof.totalBytes,expectedSha256:proof.sha256,
			readChunk:(offset,maxBytes)=>send("fileTransferReadChunk",{path:source,offset,maxBytes}),
			ttlSeconds:input.ttlSeconds,allowDownload:input.allowDownload,mimeType:input.mimeType
		});
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
/**
 * File bytes are returned directly by the router, not embedded into JSON.
 * HEAD and single-range GETs allow compatible clients to check a file or
 * resume without reissuing the capture/publish mutation.
 */
async function artifactGet($i,variables={}) {
	const method=String($i.request?.method||"GET").toUpperCase();
	if(method!=="GET"&&method!=="HEAD")return json($i,{ok:false,error:"get_or_head_required"},405);
	const record=Store.inspect(String(variables.token||""));
	if(!record)return json($i,{ok:false,error:"artifact_unknown_or_expired"},404);
	const response=$i.response||$i.res,bytes=record.buffer,total=bytes.length;
	const range=String($i.request?.headers?.range||"");
	let start=0,end=total-1,status=200;
	if(range){
		const match=/^bytes=(\d+)-(\d*)$/.exec(range);
		const suffix=/^bytes=-(\d+)$/.exec(range);
		if(match){
			start=Number(match[1]);end=match[2]?Number(match[2]):total-1;
		}else if(suffix){
			const tail=Number(suffix[1]);start=tail?Math.max(0,total-tail):total;
		}else start=total;
		if(!Number.isSafeInteger(start)||!Number.isSafeInteger(end)||start>=total||end<start||end>=total){
			if(response&&!response.headersSent){
				response.statusCode=416;
				response.setHeader("Content-Range","bytes */"+total);
				response.setHeader("Cache-Control","private, no-store, max-age=0");
			}
			return Buffer.alloc(0);
		}
		status=206;
	}
	if(response&&!response.headersSent){
		response.statusCode=status;
		response.setHeader("Content-Type",record.record.mimeType);
		response.setHeader("Cache-Control","private, no-store, max-age=0");
		response.setHeader("X-Content-Type-Options","nosniff");
		response.setHeader("Referrer-Policy","no-referrer");
		response.setHeader("Content-Security-Policy","default-src 'none'");
		response.setHeader("Accept-Ranges","bytes");
		response.setHeader("Content-Length",end-start+1);
		response.setHeader("ETag",'"'+record.record.sha256+'"');
		if(status===206)response.setHeader("Content-Range","bytes "+start+"-"+end+"/"+total);
		response.setHeader("Content-Disposition",(record.record.allowDownload?"attachment":"inline")+'; filename="'+record.record.basename+'"');
	}
	return method==="HEAD"?Buffer.alloc(0):bytes.subarray(start,end+1);
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
