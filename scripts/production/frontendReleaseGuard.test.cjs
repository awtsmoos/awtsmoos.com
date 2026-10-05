// B"H
// Boruch Hashem
// Blessed is He
const test=require("node:test"),assert=require("node:assert/strict");
const {frontendPath,validate}=require("./frontendReleaseGuard.cjs");
test("frontend classification includes shared CSS and JS without gating API or tunnel runtime releases",()=>{
 for(const p of ["geelooy/styles/main.css","geelooy/shared/header.js","geelooy/email/index.html"])assert.equal(frontendPath(p),true);
 for(const p of ["geelooy/api/tunnel/index.js","geelooy/apps/tunnel/agent/main.js","scripts/tunnel/probe.cjs","geelooy/apps/tunnel/downloads/tests/unixCandidateDefaultProbeBudget.test.mjs"])assert.equal(frontendPath(p),false);
});
test("release validator refuses missing, stale, wrong-commit and incomplete rendered evidence",()=>{
 assert.throws(()=>validate({}, "a"),/commit_mismatch/);
 const r={source:"awtsmoos-work-gate",testedCommit:"a",generatedAt:new Date().toISOString(),session:{commit:"a",frontend:true,urls:["https://awtsmoos.com/"],instructions:{ready:true,acknowledged:true},completed:["done"],remainingWork:[],nextAction:""},reports:[]};
 assert.throws(()=>validate(r,"a"),/frontend_evidence_missing/);
 assert.throws(()=>validate({...r,generatedAt:"bad"},"a"),/stale/);
 assert.throws(()=>validate(r,"b"),/commit_mismatch/);
});
