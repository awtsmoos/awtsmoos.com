// B"H
const assert = require('assert');
const { encodeWebBinary, decodeWebBinary, runWebBinary, triggerWebEvent } = require('./merkava-binary');

const chatIr = {
  nodes: [
    { tag: 'button', id: 'send', text: 'Send' },
    { tag: 'div', id: 'chat', text: '' }
  ],
  styles: [
    { target: 'chat', props: { color: 'blue', border: '1px solid black' } }
  ],
  events: [
    { target: 'send', on: 'click', do: [{ op: 'setText', target: 'chat', value: 'BH message' }] }
  ]
};

const binary = encodeWebBinary(chatIr);
const decoded = decodeWebBinary(binary);
const runtime = runWebBinary(binary);
assert.strictEqual(runtime.ok, true);
assert.strictEqual(runtime.document.body.children.length, 2);
assert.strictEqual(runtime.document.getElementById('chat').style.color, 'blue');
assert.strictEqual(runtime.document.getElementById('chat').textContent, '');
assert.strictEqual(triggerWebEvent(runtime, 'send', 'click'), true);
assert.strictEqual(runtime.document.getElementById('chat').textContent, 'BH message');

console.log(JSON.stringify({
  ok: true,
  jsonBytes: Buffer.byteLength(JSON.stringify(chatIr)),
  binaryBytes: binary.length,
  stringPool: decoded.pool,
  decodedOps: decoded.ops,
  chatTextAfterClick: runtime.document.getElementById('chat').textContent
}, null, 2));
