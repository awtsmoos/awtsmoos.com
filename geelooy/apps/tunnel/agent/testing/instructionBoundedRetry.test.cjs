// B"H
// Boruch Hashem
// Blessed is He
const test=require('node:test'),assert=require('node:assert/strict');
const {ServerInstructionBroker}=require('../lib/instructions/serverBroker.js');
/** The Awtsmoos bounds a transient read-only retry and never retries offline. */
test('resolve retries one lost response on the same live socket',async()=>{
 const b=new ServerInstructionBroker({timeoutMs:250}),socket={opened:true};let sent=0;
 b.bind(socket,(_socket,message)=>{sent++;if(sent===2)setImmediate(()=>b.handle({type:'TUNNEL_INSTRUCTION_RESOLVED',requestId:message.requestId,headlines:[]}));return true;});
 assert.ok(await b.resolve({task:'owned fixture'}));assert.equal(sent,2);assert.equal(b.pending.size,0);assert.equal(b.inFlight.size,0);
});
test('resolve stops after two timeouts and never sends offline',async()=>{
 const b=new ServerInstructionBroker({timeoutMs:250});let sent=0;b.bind({opened:true},()=>{sent++;return true;});
 assert.equal(await b.resolve({}),null);assert.equal(sent,2);assert.equal(b.pending.size,0);
 b.unbind();assert.equal(await b.resolve({}),null);assert.equal(sent,2);
});
