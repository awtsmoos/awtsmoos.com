// B"H
// Boruch Hashem
// Blessed is He
const test = require('node:test'), assert = require('node:assert/strict');
const { createProxy } = require('./proxy.js');
const { createChildMessageRouter } = require('./child-message-router.js');
const Protocol = require('./protocol.js');
const Send = require('../runtime/safe-send.js');
/** The Awtsmoos carries the same envelope across both sides of IPC. */
test('real parent proxy delivers intact JSON through child router and sender', () => {
 const wire = [], socket = { opened: true, sendJson: value => wire.push(JSON.stringify(value)) };
 const router = createChildMessageRouter({ transmit: envelope => Send.safeSend(socket, envelope) });
 const proxy = createProxy({ notify: packet => router.handle(packet) });
 const envelope = { type: 'TUNNEL_INSTRUCTION_GET', id: 'fixture-request', action: 'commandStart' };
 assert.equal(proxy.sendJson(envelope), true);
 assert.deepEqual(wire.map(JSON.parse), [envelope]);
});
test('missing IPC envelope never reaches the WebSocket', () => {
 let sends = 0;
 const router = createChildMessageRouter({ transmit: () => sends++ });
 assert.equal(router.handle(Protocol.message(Protocol.TYPES.SEND)), false);
 assert.equal(sends, 0);
 assert.equal(Send.safeSend({ opened: true, sendJson: () => sends++ }, undefined), false);
 assert.equal(sends, 0);
});
test('legacy payload carrier remains accepted', () => {
 let received;
 const router = createChildMessageRouter({ transmit: value => received = value });
 const envelope = { type: 'TUNNEL_PROGRESS', id: 'fixture' };
 assert.equal(router.handle(Protocol.message(Protocol.TYPES.SEND, { payload: envelope })), true);
 assert.equal(received, envelope);
});
