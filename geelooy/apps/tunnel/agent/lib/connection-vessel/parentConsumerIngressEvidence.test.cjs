// B"H — Awtsmoos.com never joins an old empty queue to a fresh living request.
const assert=require('node:assert/strict');
const {test}=require('node:test');
const Ingress=require('./parent-consumer-ingress.js');
const inspect=inbox=>Ingress.inspect({inbox});
test('empty attempt source cannot age a fresh durable entry',()=>{
	const result=inspect({count:1,unownedCount:0,unownedOldestAgeMs:60000,entryUnownedCount:1,entryUnownedOldestAgeMs:100});
	assert.equal(result.ingressStalled,false);
	assert.equal(result.unownedIngressAgeMs,100);
});
test('empty entry source cannot age a fresh attempt',()=>{
	const result=inspect({count:1,unownedCount:1,unownedOldestAgeMs:100,entryUnownedCount:0,entryUnownedOldestAgeMs:60000});
	assert.equal(result.ingressStalled,false);
});
test('old positive evidence still triggers the deadline',()=>{
	assert.equal(inspect({count:1,unownedCount:1,unownedOldestAgeMs:7000,entryUnownedCount:0}).ingressStalled,true);
	assert.equal(inspect({count:1,unownedCount:0,entryUnownedCount:1,entryUnownedOldestAgeMs:7000}).ingressStalled,true);
});
test('detached historical debt remains visible without freezing new work',()=>{
	const result=inspect({count:0,unownedCount:1,unownedOldestAgeMs:60000,entryUnownedCount:0});
	assert.equal(result.detachedAttemptDebt,true);
	assert.equal(result.ingressStalled,false);
	assert.equal(result.unownedIngressAgeMs,60000);
});
