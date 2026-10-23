// B"H — MCP clients must see the usable scoped retry when a source write is denied.
const test=require('node:test');
const assert=require('node:assert/strict');
const Protocol=require('./protocol.js');
const Generic=require('./genericTools.js');
test('mission write denial returns structured MCP tool error with exact retry',async()=>{
  const saved=Generic.tunnelAction;
  const token='wrt_'+'a'.repeat(24);
  Generic.tunnelAction=async()=>{
    const error=new Error('Denied mission write');
    error.data={ok:false,error:'mission_step_authorization_required',missionId:'mission-fixture',missionWriteToken:token,mustCallNext:{action:'write',path:'test.cjs',missionWriteToken:token},executionCompleted:false};
    throw error;
  };
  try{
    const result=await Protocol.dispatch({}, {}, {method:'tools/call',params:{name:'awtsmoos_tunnel_action',arguments:{action:'write',params:{path:'test.cjs',content:'fixture'}}}});
    assert.equal(result.isError,true);
    assert.equal(result.structuredContent.missionWriteToken,token);
    assert.equal(result.structuredContent.mustCallNext.action,'write');
    assert.equal(result.structuredContent.executionCompleted,false);
    assert.match(result.content[0].text,/mission_step_authorization_required/);
  }finally{Generic.tunnelAction=saved}
});
test('generic MCP action carries token through HTTP normalization',()=>{
  const {buildFsPayload}=require('../core/tunnelPayload.js');
  const token='wrt_'+'d'.repeat(24);
  const payload=Generic.tunnelPayload({action:'write',params:{path:'test.cjs',content:'fixture',missionId:'mission-fixture',missionWriteToken:token}});
  const normalized=buildFsPayload({paramKinds:{POST:payload,GET:{}}});
  assert.equal(normalized.missionWriteToken,token);
  assert.equal(normalized.content,'fixture');
  assert.equal(normalized.missionId,'mission-fixture');
});
