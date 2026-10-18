// B"H
const assert=require('node:assert/strict');
const test=require('node:test');
const Reconnect=require('../lib/runtime/main-reconnect-policy.js');
const Failure=require('../lib/ws/transportFailure.js');
const RemoteClose=require('../lib/ws/remoteClose.js');

test('1012 planned restart reconnects through a single capped short-backoff route',()=>{
 const receipt=RemoteClose.failure({code:1012,reason:'service restart'});
 const failure=Failure.classify(receipt,'socket');
 assert.equal(failure.category,'socket');
 assert.equal(Reconnect.defaultMaximumForFailure(failure),2500);
 const delays=Array.from({length:7},(_,n)=>Reconnect.delayForAttempt(n,{env:{},failure,jitterRatio:0,random:()=>0.5}));
 assert.deepEqual(delays,[1000,2000,2500,2500,2500,2500,2500]);
});
test('proxy overload and credential rejections do not inherit the faster maintenance route',()=>{
 const proxy=Failure.classify(new Error('HTTP/1.1 503 Service Unavailable'),'websocket_handshake');
 assert.equal(Reconnect.defaultMaximumForFailure(proxy),30000);
 const invalid=Failure.classify(new Error('invalid_device_credential'),'registration');
 assert.equal(Reconnect.defaultMaximumForFailure(invalid),30000);
});
