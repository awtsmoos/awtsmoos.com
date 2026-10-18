// B"H
const test=require('node:test');const assert=require('node:assert/strict');
const {buildCognitionActions}=require('../tools/fs/actionGroups/cognitionActions.js');
test('restart does not fabricate systemd success or infer an immutable checkout as service root',async()=>{
 const actions=buildCognitionActions({payload:{action:'serverRestart',service:'awtsmoos.service'},config:{root:process.cwd()}});
 const r=await actions.serverRestart();
 assert.equal(r.ok,false);assert.equal(r.performed,false);
 assert.equal(r.error,'explicit_service_control_required');
 assert.equal(r.requestedService,'awtsmoos.service');
});
test('generic start stop and process kills fail closed instead of returning cognition ok',async()=>{
 const actions=buildCognitionActions({payload:{},config:{root:process.cwd()}});
 for(const name of ['serverStart','serverStop','processKillSafe','portKillSafe']){
  const result=await actions[name]();assert.equal(result.ok,false,name);assert.equal(result.performed,false,name);
 }
});
