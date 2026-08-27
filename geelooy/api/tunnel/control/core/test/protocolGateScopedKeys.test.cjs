// B"H
const assert = require('assert');
const { gateKeys, armProtocolGate, pendingProtocolGate } = require('../protocolGateStore.js');
assert.deepEqual(gateKeys({ tunnelName: 'awt-only' }), []);
armProtocolGate({ tunnelName: 'awt-only' }, { required: true, question: 'q' });
assert.equal(pendingProtocolGate({ tunnelName: 'awt-only' }), null);
armProtocolGate({ tunnelName: 'awt', conversationId: 'c1', logicalAgentId: 'a1' }, { required: true, question: 'q' });
assert.ok(pendingProtocolGate({ tunnelName: 'awt', conversationId: 'c1' }));
assert.equal(pendingProtocolGate({ tunnelName: 'awt', conversationId: 'c2' }), null);
console.log('B"H protocol gates are scoped and do not arm on tunnel-only blanks');
