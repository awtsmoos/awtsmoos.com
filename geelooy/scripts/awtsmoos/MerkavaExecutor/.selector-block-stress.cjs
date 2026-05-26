// B"H
const assert = require('assert');
const M = require('./merkavaexecutor.cjs');

(async () => {
  const files = {
    '/index.html': `<link rel="stylesheet" href="/style.css"><main id="app"><button id="send" class="primary" data-kind="go">Send</button><awts-row id="row1" awts-kind="spark">A</awts-row><awts-row id="row2" awts-kind="spark">B</awts-row></main>`,
    '/style.css': `button.primary[data-kind="go"]:hover{color:blue;padding:8px;width:100%}
awts-row[awts-kind="spark"], #send{margin-left:7em;transform:calc(100% - 7em)}`
  };
  const bin = await M.compileToBinary({ files, entry: '/index.html' }, { type: 'source', format: 'mapp' });
  const run = await M.executeBinary(bin);
  const web = M.decodeWebBinary(M.decodeUnifiedApp(bin).webBinary);
  assert.strictEqual(web.ops.some(op => op.op === 'SET_STYLE_BLOCK'), true);
  assert.strictEqual(run.web.document.getElementById('send').style.color, 'blue');
  assert.strictEqual(run.web.document.getElementById('send').style.width, '100%');
  assert.strictEqual(run.web.document.getElementById('row1').style.marginLeft, '7em');
  assert.strictEqual(run.web.document.getElementById('row2').style.transform, 'calc(100% - 7em)');
  assert.strictEqual(web.pool.filter(x => x === 'button.primary[data-kind="go"]:hover').length, 1);
  console.log(JSON.stringify({ ok: true, bytes: bin.length, webOps: web.ops.length, pool: web.pool, sendStyle: run.web.document.getElementById('send').style, rowStyle: run.web.document.getElementById('row1').style }, null, 2));
})().catch(error => { console.error(error.stack || error.message); process.exit(1); });
