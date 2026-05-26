// B"H
const assert = require('assert');
const path = require('path');
const M = require('./merkavaexecutor.cjs');

(async () => {
  const bridge = M.createNativeCapabilityBridge();
  const joined = bridge.call('path.join', 'a', 'b', 'c.txt');
  assert.strictEqual(joined, path.join('a', 'b', 'c.txt'));
  const hash = bridge.call('crypto.createHash', 'sha256').update('BH').digest('hex');
  assert.strictEqual(hash.length, 64);
  const temp = './.native-bridge-temp.txt';
  bridge.call('fs.writeFileSync', temp, 'BH bridge');
  assert.strictEqual(bridge.call('fs.readFileSync', temp, 'utf8'), 'BH bridge');
  bridge.call('fs.rmSync', temp);

  const document = bridge.get('document');
  const el = bridge.call('document.createElement', 'awts-card');
  el.setAttribute('id', 'card');
  el.textContent = 'native DOM';
  document.body.appendChild(el);
  assert.strictEqual(bridge.call('document.getElementById', 'card').textContent, 'native DOM');

  let heard = null;
  const self = bridge.get('self');
  self.addEventListener('message', event => { heard = event.data; });
  self.postMessage({ ok: true, text: 'worker bridge' });
  assert.deepStrictEqual(heard, { ok: true, text: 'worker bridge' });

  console.log(JSON.stringify({
    ok: true,
    node: { joined, hashLength: hash.length, fs: 'write/read/rm ok' },
    browser: { card: document.getElementById('card').textContent },
    worker: { heard, messages: bridge.capabilities.messages }
  }, null, 2));
})().catch(error => { console.error(error.stack || error.message); process.exit(1); });
