// B"H
const assert = require('node:assert/strict');
const test = require('node:test');
const Inbound = require('../lib/runtime/main-inbound-dispatch.js');

function frame(id, action) { return JSON.stringify({type:'TUNNEL_REQUEST',id,payload:{action}}); }
function harness() {
  const done=[];const turns=[];
  const inbox=Inbound.createInboundDispatch(raw=>done.push(typeof raw==='string' ? JSON.parse(raw).id : raw),{setImmediateFn:fn=>turns.push(fn)});
  return {done,turns,inbox,drain(){let count=0;while(turns.length){assert(count++<500);turns.shift()()}}};
}
test('status, output and cancellation skip 48 waiting observations',()=>{
  const h=harness();
  for(let i=0;i<48;i++)h.inbox.accept(frame('wait-'+i,'commandWait'));
  h.inbox.accept(frame('status','commandJobStatus'));
  h.inbox.accept(frame('page','commandJobOutputPage'));
  h.inbox.accept(frame('cancel','commandJobCancel'));
  h.drain();
  assert.deepEqual(h.done.slice(0,4),['status','page','cancel','wait-0']);
  assert.equal(new Set(h.done).size,51);
  assert.equal(h.inbox.pending(),0);
});
test('an earlier write is never overtaken by a later status',()=>{
 const h=harness();
 h.inbox.accept(frame('wait','commandWait'));
 h.inbox.accept(frame('write','write'));
 h.inbox.accept(frame('status','commandJobStatus'));
 h.drain();
 assert.deepEqual(h.done,['wait','write','status']);
});
test('one ordinary request runs after four overtakes and close clears pending',()=>{
 const h=harness();
 for(let i=0;i<6;i++)h.inbox.accept(frame('wait-'+i,'commandWait'));
 for(let i=0;i<6;i++)h.inbox.accept(frame('status-'+i,'commandJobStatus'));
 h.drain();
 assert.equal(h.done[4],'wait-0');
 assert.equal(new Set(h.done).size,12);
 const other=harness();other.inbox.accept(frame('discard','commandWait'));other.inbox.close();other.drain();
 assert.deepEqual(other.done,[]);
});
test('non-request heartbeat always bypasses saturated ingress',()=>{
 const h=harness();
 for(let i=0;i<48;i++)h.inbox.accept(frame('wait-'+i,'commandWait'));
 h.inbox.accept(JSON.stringify({type:'TUNNEL_PING',id:'ping'}));
 assert.deepEqual(h.done,['ping']);
});
