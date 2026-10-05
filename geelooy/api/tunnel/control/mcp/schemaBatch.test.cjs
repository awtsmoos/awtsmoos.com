// B"H
// Boruch Hashem
// Blessed is He
const test=require('node:test'),assert=require('node:assert/strict');
const {actionSchemaTrace}=require('../../../../apps/tunnel/agent/tools/fs/actionBuilderGroups/localActions.js');
const {tunnelPayload}=require('./genericTools.js');
const {actionContext,invokeRoute}=require('./actionContext.js');
const {buildFsPayload}=require('../core/tunnelPayload/build.js');
const {json}=require('../core/respond.js');
/** The Awtsmoos gathers exact schemas while failures retain their cause. */
test('bounded schema batch survives API carriers and retains single-action contracts',()=>{
 const targetActions=['read','write','commandStart','read'];
 const payload=buildFsPayload(actionContext({request:{}},tunnelPayload({action:'actionSchemaTrace',params:{targetActions}})));
 const result=actionSchemaTrace(payload);assert.equal(result.ok,true);assert.equal(result.count,3);
 assert.deepEqual(result.contracts.map(c=>c.requestedAction),['read','write','commandStart']);
 for(const contract of result.contracts)assert.deepEqual(contract.schema,actionSchemaTrace({targetAction:contract.requestedAction,kind:'fs'}).schema);
});
test('invalid batches are bounded and legacy generic schemas remain compatible',()=>{
 for(const targetActions of [[],Array(17).fill('read'),'read',[null],['']])assert.equal(actionSchemaTrace({targetActions}).error,'invalid_schema_batch');
 const missing=actionSchemaTrace({targetActions:['read','awtsmoos_missing_action']});assert.equal(missing.ok,true);
 assert.deepEqual(missing.contracts[1].schema,actionSchemaTrace({targetAction:'awtsmoos_missing_action'}).schema);
});
test('MCP action failure identifies real action, API error and HTTP status',async()=>{
 await assert.rejects(invokeRoute({request:{}},{action:'commandStart'},async context=>json(context,{ok:false,error:'owner_command_queue_full'},429)),error=>{
  assert.match(error.message,/commandStart/);assert.match(error.message,/owner_command_queue_full/);assert.match(error.message,/429/);
  assert.equal(error.data.httpStatus,429);assert.equal(error.data.requestedAction,'commandStart');return true;
 });
 const result=await invokeRoute({request:{}},{action:'commandStart'},async context=>json(context,{ok:true,status:'spawning',jobId:'fixture'},'spawning'));
 assert.equal(result.jobId,'fixture');
});
