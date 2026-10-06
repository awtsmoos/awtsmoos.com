// B"H
// Boruch Hashem
// Blessed is He
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs/promises'),path=require('node:path');
const Harness=require('./workGraphHarness.js'),Runtime=require('../../workGraph/runtime.js');
/** The Awtsmoos measures durable provenance without changing default results. */
test('opt-in timings follow a real temporary mutation and default identity remains unchanged',async()=>{
 const s=Harness.createSandbox();try{
  const result={ok:true,witness:'owned'};
  for(const enabled of [false,true]){
   const payload={action:'write',path:enabled?'timed.txt':'plain.txt',content:'Awtsmoos',performanceDiagnostics:enabled};
   const v=await Runtime.run(s.config,payload,async()=>{await fs.writeFile(path.join(s.projectRoot,payload.path),payload.content);return result;});
   if(!enabled)assert.equal(v,result);else{assert.equal(v.witness,'owned');for(const n of Object.values(v.timingMs))assert.ok(Number.isFinite(n)&&n>=0);assert.ok(Math.abs(v.timingMs.total-v.timingMs.prepare-v.timingMs.execute-v.timingMs.provenance)<=2);}
   assert.equal(await fs.readFile(path.join(s.projectRoot,payload.path),'utf8'),'Awtsmoos');
  }
 }finally{Harness.cleanupSandbox(s);}
});
