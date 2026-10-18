// B"H
const assert = require('node:assert/strict');
const test = require('node:test');
const {retryPairingRequest}=require('../unix-pairing-direct.cjs');
test('three bounded attempts preserve a single logical request after transient timeouts',async()=>{
  let attempts=0;
  const response=await retryPairingRequest(async()=>{
    attempts++;
    if(attempts<3) throw new Error('request_timeout');
    return {ok:true,pairingId:'pair_fixture'};
  },3,async()=>{});
  assert.equal(response.ok,true);
  assert.equal(attempts,3);
});
test('invalid public keys fail once rather than spamming the service',async()=>{
  let attempts=0;
  const response=await retryPairingRequest(async()=>{
    attempts++;return {ok:false,error:'invalid_device_public_key'};
  },3,async()=>{});
  assert.equal(response.ok,false);
  assert.equal(attempts,1);
});
test('permanently unreachable pairing fails after exactly three attempts',async()=>{
  let attempts=0;
  await assert.rejects(retryPairingRequest(async()=>{attempts++;throw Error('network');},3,async()=>{}),/network/);
  assert.equal(attempts,3);
});
