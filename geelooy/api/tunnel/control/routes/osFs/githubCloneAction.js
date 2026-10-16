//B"H
//Boruch Hashem
//Blessed is He

"use strict";
const crypto=require("node:crypto");
const {assertWritable}=require("./writeAccess.js");
const {cloneSpecification}=require("./githubCloneSource.js");
const {downloadGithubArchive}=require("./githubArchiveDownload.js");
const {parseGithubArchive}=require("./githubArchiveParser.js");

const active=new Map();
function fingerprint(spec){return crypto.createHash("sha256").update(JSON.stringify([spec.source,spec.ref,spec.destination])).digest("hex");}
function stages(start){const entries=[];return {entries,step(stage){entries.push({stage,elapsedMs:Date.now()-start});}};}
async function preflight(dispatch,spec,identity) {
	const check=await assertWritable(identity.context,identity.userId,{path:spec.destination});
	if(check.error)throw Error(check.error.error||"GIT_CLONE_UNAUTHORIZED_DESTINATION");
	const existing=await dispatch({action:"list",path:spec.destination});
	if(existing.ok!==true)throw Error(existing.error||"GIT_CLONE_DESTINATION_UNAVAILABLE");
	if(!existing.items?.length)return null;
	const marker=await dispatch({action:"read",path:spec.destination+"/.awtsmoos-clone.json",maxChars:16000}).catch(()=>null);
	let record;
	try{record=JSON.parse(marker?.content||"");}catch{}
	if(record?.fingerprint===fingerprint(spec)&&record?.status==="complete")return record;
	throw Error("GIT_CLONE_DESTINATION_NOT_EMPTY");
}
async function importFiles(dispatch,spec,parsed,stamp) {
	const changed=[];
	for(let start=0;start<parsed.files.length;start+=4){
		const batch=parsed.files.slice(start,start+4);
		const values=await Promise.all(batch.map(async file=>{
			try{
				const target=spec.destination+"/"+file.path;
				const result=await dispatch({action:"write",path:target,content:file.content,autoPreview:false});
				if(result?.ok!==true)throw Error(result?.error||"write_rejected");
				return {ok:true,path:target};
			}catch(error){return {ok:false,path:file.path,error:error.message};}
		}));
		changed.push(...values.filter(item=>item.ok).map(item=>item.path));
		const failed=values.find(item=>!item.ok);
		if(failed){
			const failure=Error("GIT_CLONE_WRITE_FAILED:"+failed.path);
			failure.partialPaths=changed;
			throw failure;
		}
		stamp.step("imported_"+Math.min(start+batch.length,parsed.files.length)+"_of_"+parsed.files.length);
	}
	return changed;
}
/** Import a bounded public GitHub source snapshot into only an owned VFS alias. */
async function gitClone($i,userId,payload={},dispatch,dependencies={}) {
	const started=Date.now(),progress=stages(started);
	let stage="validation",spec;
	const step=name=>{stage=name;progress.step(name);};
	try{
		spec=cloneSpecification(payload);
		const key=userId+":"+spec.destination;
		if(active.has(key))return {ok:false,action:"gitClone",error:"GIT_CLONE_ALREADY_IN_PROGRESS",stage};
		if(active.size>=3)return {ok:false,action:"gitClone",error:"GIT_CLONE_CAPACITY_LIMIT",retryAfterMs:2000,stage};
		if([...active.keys()].some(value=>value.startsWith(userId+":")))return {ok:false,action:"gitClone",error:"GIT_CLONE_OWNER_BUSY",retryAfterMs:2000,stage};
		const work=(async()=>{
			step("authorized_destination");
			const seen=await preflight(dispatch,spec,{context:$i,userId});
			if(seen)return {ok:true,action:"gitClone",kind:spec.kind,alreadyImported:true,source:spec.source,ref:spec.ref,destination:spec.destination,filesImported:seen.filesImported,partial:seen.partial,elapsedMs:Date.now()-started,stages:progress.entries};
			step("downloading_github_archive");
			const buffer=await(dependencies.download||downloadGithubArchive)(spec.archiveUrl,{timeoutMs:payload.timeoutMs});
			step("validating_archive");
			const parsed=(dependencies.parse||parseGithubArchive)(buffer);
			if(parsed.files.some(x=>x.path===".awtsmoos-clone.json"))throw Error("GIT_CLONE_RESERVED_SOURCE_FILE");
			step("writing_virtual_files");
			const changed=await importFiles(dispatch,spec,parsed,progress);
			const receipt={status:"complete",fingerprint:fingerprint(spec),source:spec.source,ref:spec.ref,kind:spec.kind,filesImported:changed.length,sourceSha256:crypto.createHash("sha256").update(buffer).digest("hex"),partial:!parsed.complete,skippedBinary:parsed.skippedBinary,importedAt:new Date().toISOString()};
			const saved=await dispatch({action:"write",path:spec.destination+"/.awtsmoos-clone.json",content:JSON.stringify(receipt,null,2),autoPreview:false});
			if(saved?.ok!==true)throw Error("GIT_CLONE_RECEIPT_WRITE_FAILED");
			step("complete");
			return {ok:true,action:"gitClone",...receipt,destination:spec.destination,archiveBytes:buffer.length,totalTextBytes:parsed.totalTextBytes,elapsedMs:Date.now()-started,stages:progress.entries,fullGitHistory:false,nativeShell:false};
		})();
		active.set(key,work);
		try{return await work;}finally{active.delete(key);}
	}catch(error) {
		return {ok:false,action:"gitClone",error:error.message,stage,partial:Boolean(error.partialPaths?.length),writtenPaths:error.partialPaths?.slice(0,30)||[],destination:spec?.destination||null,elapsedMs:Date.now()-started,stages:progress.entries};
	}
}
module.exports={gitClone,preflight,importFiles};
