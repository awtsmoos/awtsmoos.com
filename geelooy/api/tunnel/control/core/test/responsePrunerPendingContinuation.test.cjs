// B"H
const assert=require("node:assert/strict");
const {pruneTunnelResponse}=require("../responsePruner.js");
const observeWith={action:"retryAction",controlRequestId:"ctrl-123",nonce:"abc"};
const r=pruneTunnelResponse({ok:true,pending:true,state:"dispatched_pending_acceptance",observeWith,retryPayload:observeWith,deviceAccepted:false,blindRedispatchForbidden:true,freshRedispatchSafe:false,noise:"discard"},{});
assert.deepEqual(r.observeWith,observeWith);assert.equal(r.deviceAccepted,false);assert.equal(r.blindRedispatchForbidden,true);assert.equal(r.freshRedispatchSafe,false);assert.equal("noise" in r,false);
console.log("pending continuation preserved");
