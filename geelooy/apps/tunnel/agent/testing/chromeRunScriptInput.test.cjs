// B"H
const test=require("node:test"), assert=require("node:assert/strict");
const {chromeScriptSteps,chromeRunScript}=require("../tools/chrome/actions.js");
const {ACTIONS}=require("../tools/chrome/index.js");
test("chromeRunScript preserves JSON and structured steps",async()=>{
 const steps=[{type:"unsupported_test_step"}];
 for(const payload of [{script:steps},{steps},{actions:steps},{actionsJson:JSON.stringify(steps)},{script:JSON.stringify(steps)}]){
  assert.deepEqual(chromeScriptSteps(payload),steps);
  const r=await chromeRunScript(payload);
  assert.equal(r.count,1);assert.equal(r.results[0].error,"unknown_step");
 }
});
test("chromeRunScript rejects malformed or absent script rather than reporting empty success",async()=>{
 for(const payload of [{},{script:"not-json"},{script:{}},{steps:5}]){
  const r=await chromeRunScript(payload);
  assert.equal(r.ok,false);assert.equal(r.error,"missing_or_invalid_script_steps");
 }
});
test("native Chrome action manifest includes evalSlim compatibility alias",()=>{
 assert.equal(ACTIONS.chromeEvalSlim,ACTIONS.chromeEval);
});
