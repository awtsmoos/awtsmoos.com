//B"H
//Boruch Hashem
//Blessed is He

"use strict";
const {cleanPath,splitPath}=require("./path.js");
const {aliasOwned}=require("./aliases.js");

/** Read the verified completed import receipt from an account-owned VFS path. */
async function gitCloneStatus($i,userId,payload={},dispatch) {
	let destination;
	try{
		destination=cleanPath(payload.destination||payload.path||payload.p||"");
		const parsed=splitPath(destination);
		if(parsed.root||!parsed.innerPath)throw Error("GIT_CLONE_DESTINATION_REQUIRED");
		if(!(await aliasOwned($i,userId,parsed.aliasId))){
			return {ok:false,action:"gitCloneStatus",error:"alias_not_owned",status:403};
		}
		const found=await dispatch({action:"read",path:destination+"/.awtsmoos-clone.json",maxChars:4096,autoPreview:false});
		if(found?.ok!==true||!found.content){
			return {ok:false,action:"gitCloneStatus",error:"GIT_CLONE_NOT_IMPORTED",destination,status:404};
		}
		let receipt;
		try{receipt=JSON.parse(String(found.content));}catch{throw Error("GIT_CLONE_RECEIPT_CORRUPT");}
		if(receipt?.status!=="complete"||receipt.kind!=="github-public-source-snapshot"||
			!/^https:\/\/github\.com\/[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+$/.test(receipt.source||"")||
			!/^[a-f0-9]{64}$/.test(receipt.sourceSha256||"")||
			!Number.isInteger(receipt.filesImported)||receipt.filesImported<1){
			throw Error("GIT_CLONE_RECEIPT_INVALID");
		}
		return {ok:true,action:"gitCloneStatus",destination,status:"complete",
			source:receipt.source,ref:receipt.ref,filesImported:receipt.filesImported,
			partial:receipt.partial===true,skippedBinary:receipt.skippedBinary||[],
			sourceSha256:receipt.sourceSha256,importedAt:receipt.importedAt,
			kind:receipt.kind,fullGitHistory:false,nativeShell:false,
			note:"Stored snapshot receipt; this does not prove every imported file is unchanged."};
	}catch(error){return {ok:false,action:"gitCloneStatus",error:error.message,destination:destination||null};}
}
module.exports={gitCloneStatus};
