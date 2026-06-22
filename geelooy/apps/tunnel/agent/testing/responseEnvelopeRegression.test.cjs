// B"H
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const main = fs.readFileSync(path.resolve(__dirname, '../main.js'), 'utf8');

/**
 * B"H
 * Chapter 518: The envelope became sovereign.
 * Results may bring their own id/type/controlRequestId, but they may not steal
 * the transport throne. This static guard prevents the old spread-order bug.
 */
assert(main.includes('function responseEnvelope(data, payload, result, enqueuedAt)'), 'responseEnvelope exists');
assert(main.includes('requestAction'), 'requestAction is present');
assert(main.includes('actualAction'), 'actualAction is present');
assert(main.includes('actionMismatch'), 'actionMismatch is present');
assert(main.includes('delete safeResult.type; delete safeResult.id; delete safeResult.controlRequestId'), 'unsafe transport fields are deleted');
assert(main.includes('return { ...safeResult, type:"TUNNEL_RESPONSE", id:data.id, controlRequestId:payload?.controlRequestId'), 'transport fields overwrite result fields after safe spread');
assert(main.includes('safeSend(ws, responseEnvelope(data, payload, result, enqueuedAt));'), 'dispatcher uses responseEnvelope');
console.log(JSON.stringify({ ok: true, suite: 'response-envelope-regression' }, null, 2));
