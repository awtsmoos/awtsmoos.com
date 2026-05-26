// B"H
const assert = require('assert');
const MerkavaExecutor = require('./merkavaexecutor.cjs');

(async () => {
  const items = Array.from({ length: 24 }, (_, i) => i + 1);
  const sourceHtml = `<main id="app"><button id="send">Send</button><section id="chat">${items.map(i => `<p id="m${i}">Message ${i}</p>`).join('')}</section></main>`;
  const sourceCss = `#app{display:grid;gap:8px;padding:12px}#send{border-radius:12px;padding:8px 12px}#chat{color:blue;padding:10px;border:1px solid black}${items.map(i => `#m${i}{color:blue;padding:4px}`).join('')}`;
  const sourceJs = `class Chat { send(msg){ chat.textContent = msg; } } let app = new Chat(); app.send("B'H");`;
  const sourceBytes = Buffer.byteLength(sourceHtml + sourceCss + sourceJs);

  const appIr = {
    web: {
      nodes: [
        { tag: 'main', id: 'app', text: '' },
        { tag: 'button', id: 'send', parent: 'app', text: 'Send' },
        { tag: 'section', id: 'chat', parent: 'app', text: '' },
        ...items.map(i => ({ tag: 'p', id: `m${i}`, parent: 'chat', text: `Message ${i}` }))
      ],
      styles: [
        { target: 'app', props: { display: 'grid', gap: '8px', padding: '12px' } },
        { target: 'send', props: { borderRadius: '12px', padding: '8px 12px' } },
        { target: 'chat', props: { color: 'blue', padding: '10px', border: '1px solid black' } },
        ...items.map(i => ({ target: `m${i}`, props: { color: 'blue', padding: '4px' } }))
      ],
      events: []
    },
    scripts: [{ name: 'boot', source: sourceJs }]
  };

  const binary = await MerkavaExecutor.compileToBinary(appIr, { type: 'app' });
  assert.strictEqual(MerkavaExecutor.magicOf(binary), 'MAPP');
  const run = await MerkavaExecutor.executeBinary(binary);
  assert.strictEqual(run.ok, true);
  assert.strictEqual(run.web.document.getElementById('chat').textContent, "B'H");
  assert.strictEqual(run.web.document.getElementById('chat').style.color, 'blue');
  assert.ok(binary.length < sourceBytes, `compiled ${binary.length} must be smaller than source ${sourceBytes}`);

  console.log(JSON.stringify({
    ok: true,
    magic: MerkavaExecutor.magicOf(binary),
    sourceBytes,
    compiledBytes: binary.length,
    savedBytes: sourceBytes - binary.length,
    savedPercent: Number(((1 - binary.length / sourceBytes) * 100).toFixed(1)),
    ratio: Number((binary.length / sourceBytes).toFixed(2)),
    chatText: run.web.document.getElementById('chat').textContent,
    decoded: {
      webOps: run.app.web.ops.length,
      scripts: run.app.scripts.map(s => ({ name: s.name, kind: s.kind, bytes: s.binary ? s.binary.length : 0, native: !!s.setText }))
    }
  }, null, 2));
})().catch(error => {
  console.error(error.stack || error.message);
  process.exit(1);
});
