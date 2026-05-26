// B"H
const assert = require('assert');
const MerkavaExecutor = require('./merkavaexecutor.cjs');

(async () => {
  const html = `<button id="send">Send</button><div id="chat"></div><link rel="stylesheet" href="/style.css"><script src="/app.js"></script>`;
  const css = `#chat{color:blue}`;
  const js = `chat.textContent="BH";`;
  const files = { '/index.html': html, '/style.css': css, '/app.js': js };
  const sourceBytes = Buffer.byteLength(html + css + js);
  const binary = await MerkavaExecutor.compileToBinary({ files, entry: '/index.html' }, { type: 'source' });
  const legacy = await MerkavaExecutor.compileToBinary({ files, entry: '/index.html' }, { type: 'source', format: 'mapp' });
  const run = await MerkavaExecutor.executeBinary(binary);
  assert.strictEqual(MerkavaExecutor.magicOf(binary), 'MD2\u0000');
  assert.strictEqual(MerkavaExecutor.magicOf(legacy), 'MAPP');
  assert.strictEqual(run.document.getElementById('chat').textContent, 'BH');
  assert.strictEqual(run.document.getElementById('chat').style.color, 'blue');
  assert.ok(binary.length < sourceBytes, `binary ${binary.length} must be smaller than source ${sourceBytes}`);

  console.log(JSON.stringify({
    ok: true,
    defaultMagic: MerkavaExecutor.magicOf(binary),
    legacyMagic: MerkavaExecutor.magicOf(legacy),
    sourceBytes,
    compiledBytes: binary.length,
    legacyBytes: legacy.length,
    savedBytes: sourceBytes - binary.length,
    savedPercent: Number(((1 - binary.length / sourceBytes) * 100).toFixed(1)),
    chatText: run.document.getElementById('chat').textContent,
    style: run.document.getElementById('chat').style
  }, null, 2));
})().catch(error => {
  console.error(error.stack || error.message);
  process.exit(1);
});
