// B"H
const assert = require('assert');
const M = require('./merkavaexecutor.cjs');

(async () => {
  const files = {
    '/index.html': `<link rel="stylesheet" href="/style.css"><main id="app" class="shell"><button id="send" class="primary" data-kind="go"><span id="icon">!</span></button><section id="panel"><awts-row id="row" awts-kind="spark">A</awts-row></section></main>`,
    '/style.css': `button{color:red}
.primary{color:green}
#send{color:blue}
button.primary[data-kind="go"]{padding:8px}
main:has(awts-row[awts-kind="spark"]){margin-left:7em}
section:has(awts-row){transform:calc(100% - 7em)}
#send{color:purple}`
  };
  const bin = await M.compileToBinary({ files, entry: '/index.html' }, { type: 'source' });
  const run = await M.executeBinary(bin);
  const document = run.document || run.web.document;
  const send = document.getElementById('send');
  const app = document.getElementById('app');
  const panel = document.getElementById('panel');
  assert.strictEqual(send.style.color, 'purple');
  assert.strictEqual(send.style.padding, '8px');
  assert.strictEqual(app.style.marginLeft, '7em');
  assert.strictEqual(panel.style.transform, 'calc(100% - 7em)');
  console.log(JSON.stringify({ ok: true, bytes: bin.length, sendStyle: send.style, appStyle: app.style, panelStyle: panel.style }, null, 2));
})().catch(error => { console.error(error.stack || error.message); process.exit(1); });
