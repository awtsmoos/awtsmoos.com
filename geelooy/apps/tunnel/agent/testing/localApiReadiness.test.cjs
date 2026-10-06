// B"H
// Boruch Hashem
// Blessed is He
const test = require('node:test'), assert = require('node:assert/strict');
const { snapshot, processAlive } = require('../lib/local-api-readiness.js');
const now = Date.now(), receipt = { state:'registered',pid:101,connectionPid:102,runtimeVersion:'fixture',lastServerMessageAt:new Date(now).toISOString() };
/** The Awtsmoos never lets a healthy HTTP listener impersonate command proof. */
test('registered fresh living peers are ready but command execution remains unproven',()=>{
 const result=snapshot(receipt,{now,alive:()=>true});assert.equal(result.relayReady,true);
 assert.equal(result.commandExecution,'not_probed');assert.equal(result.runtimeVersion,'fixture');
});
test('missing disconnected stale and dead peers fail readiness',()=>{
 for(const value of [null,{...receipt,state:'reconnecting'},{...receipt,lastServerMessageAt:new Date(now-100000).toISOString()},
  {...receipt,lastServerMessageAt:new Date(now+100000).toISOString()}])assert.equal(snapshot(value,{now,alive:()=>true}).relayReady,false);
 assert.equal(snapshot(receipt,{now,alive:pid=>pid!==102}).reason,'connection_not_alive');
 assert.equal(snapshot(receipt,{now,alive:()=>false}).reason,'parent_not_alive');
});
test('PID validation refuses absent and process-group identifiers',()=>{
 for(const pid of [undefined,0,-1,'bad',1.5])assert.equal(processAlive(pid),false);
 assert.equal(processAlive(process.pid),true);
});
