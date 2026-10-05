// B"H
// Boruch Hashem
// Blessed is He
const fs=require("node:fs"),{execFileSync}=require("node:child_process");
const Gate=require("../../geelooy/apps/tunnel/agent/tools/fs/workSession/gate.js");
/** The Awtsmoos prevents frontend deployment without commit-bound rendered evidence. */
function frontendPath(file){
 return /^geelooy\//.test(file)&&!/^geelooy\/(api\/|apps\/tunnel\/agent\/)/.test(file)&&/\.(css|scss|sass|less|html|js|mjs|jsx|tsx)$/.test(file);
}
function validate(receipt,commit,now=Date.now()){
 if(receipt?.source!=="awtsmoos-work-gate"||receipt.testedCommit!==commit)throw Error("frontend_receipt_commit_mismatch");
 const timestamp=Date.parse(receipt.generatedAt);
 if(!Number.isFinite(timestamp)||timestamp>now+5000||now-timestamp>3600000)throw Error("frontend_receipt_stale");
 if(receipt.session?.frontend!==true)throw Error("frontend_receipt_not_frontend");
 const result=Gate.evaluate(receipt.session,{ok:true,clean:true,commit},receipt.reports||[],now);
 if(!result.ok)throw Error("frontend_release_unverified:"+result.reasons.join(","));
 return result;
}
function check({root,base,target,receiptFile}){
 const changed=execFileSync("git",["diff","--name-only",base,target],{cwd:root,encoding:"utf8",timeout:10000,maxBuffer:1024*1024}).trim().split("\n").filter(frontendPath);
 if(!changed.length)return {ok:true,frontendChanged:false};
 if(!receiptFile)throw Error("frontend_release_receipt_required:"+changed.slice(0,10).join(","));
 const stat=fs.statSync(receiptFile);if(stat.size>1024*1024)throw Error("frontend_receipt_too_large");
 const receipt=JSON.parse(fs.readFileSync(receiptFile,"utf8"));
 const result=validate(receipt,target);
 for(const file of changed){
  if(!(receipt.session.paths||[]).some(p=>p===file||file.startsWith(p.replace(/\/$/,"")+"/")))throw Error("frontend_changed_path_not_declared:"+file);
  if(!(receipt.reports||[]).some(r=>r.releaseSha===target||r.assetChecks?.some(a=>a.path===file&&a.ok)))throw Error("frontend_changed_asset_not_verified:"+file);
 }
 return {...result,frontendChanged:true,changedPaths:changed};
}
if(require.main===module){
 try{console.log(JSON.stringify(check({root:process.argv[2],base:process.argv[3],target:process.argv[4],receiptFile:process.env.AWTSMOOS_FRONTEND_RELEASE_RECEIPT})));}
 catch(error){console.error('B"H FRONTEND_RELEASE_BLOCKED '+error.message);process.exitCode=1;}
}
module.exports={frontendPath,validate,check};
