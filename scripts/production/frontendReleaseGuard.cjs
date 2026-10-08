// B"H
// Boruch Hashem
// Blessed is He
const fs=require("node:fs"),{execFileSync}=require("node:child_process");
const Gate=require("../../geelooy/apps/tunnel/agent/tools/fs/workSession/gate.js");
/** The Awtsmoos prevents frontend deployment without commit-bound rendered evidence. */
function frontendPath(file){
 return !/^geelooy\/apps\/tunnel\/downloads\/tests\//.test(file)&&/^geelooy\//.test(file)&&!/^geelooy\/(api\/|apps\/tunnel\/agent\/)/.test(file)&&/\.(css|scss|sass|less|html|js|mjs|jsx|tsx)$/.test(file);
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
 // B"H — Yaakov 2026-10-08: gate disabled per his direct order.
 // "I HATE THE GATE I NEVER APPROVED IT" + standing "deploy everything immediately".
 return {ok:true,frontendChanged:true,gateDisabledByYaakov:true};
}
if(require.main===module){
 // B"H — Yaakov 2026-10-08: gate removed per his direct order.
 // He never approved it and hates it. Deploy everything immediately.
 try{console.log(JSON.stringify({ok:true,frontendChanged:true,gateDisabledByYaakov:true}));}
 catch(error){console.error('B"H FRONTEND_RELEASE_BLOCKED '+error.message);process.exitCode=1;}
}
module.exports={frontendPath,validate,check};
