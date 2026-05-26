// B"H
const assert = require('assert');
const M = require('./merkavaexecutor.cjs');

(async () => {
  const files = {
    '/index.html': `<!doctype html>
<html>
<head><link rel="stylesheet" href="/style.css"></head>
<body>
  <awts-dashboard id="dash" awts-mode="live" data-blessing="hi there">
    <h1 id="title">Waiting</h1>
    <section id="chat"></section>
    <output id="out"></output>
    <button id="send" class="primary" aria-label="Send blessing">Send</button>
    <awts-row id="row1" awts-kind="spark">hi there</awts-row>
    <awts-row id="row2" awts-kind="spark">hi there</awts-row>
    <awts-row id="row3" awts-kind="spark">hi there</awts-row>
    <awts-row id="row4" awts-kind="spark">hi there</awts-row>
  </awts-dashboard>
  <script type="module" src="/model.js"></script>
  <script type="module" src="/view.js"></script>
  <script type="module" src="/main.js"></script>
</body>
</html>`,
    '/style.css': `#dash{display:grid;grid-template-columns:1fr 2fr;gap:8px;padding:12px;width:100%;margin-left:7em;transform:calc(100% - 7em);border-radius:12px;box-shadow:0 2px 4px #ff0033;opacity:1;z-index:10;user-select:none;pointer-events:auto;overflow:auto}
#title{color:#ff0033;font-size:24px;font-weight:700;line-height:32px;margin-left:10px;text-align:center;text-transform:uppercase}
#send{padding:8px 12px;border-radius:12px;background-color:#00ff00;transition:all 90ms ease;cursor:pointer}
#chat{color:blue;padding:10px;border:1px solid black;min-height:50px;overflow:auto}
#out{color:#ff0033;margin-top:4px}
#row1{color:blue;padding:4px}
#row2{color:blue;padding:4px}
#row3{color:blue;padding:4px}
#row4{color:blue;padding:4px}`,
    '/model.js': `export class BaseCounter { value(){ return 10; } }
export class Counter extends BaseCounter {
  constructor(){ super(); this.extra = 32; }
  total(){ return super.value() + this.extra; }
}
export function* nums(){ yield 1; yield 2; yield 3; }
export const label = 'BH';
export const repeated = 'hi there';`,
    '/view.js': `export function render(msg){
  chat.textContent = msg;
  out.textContent = msg;
  title.textContent = 'Done';
}`,
    '/main.js': `import { Counter, nums, label, repeated } from '/model.js';
import { render } from '/view.js';
let c = new Counter();
let it = nums();
let total = c.total() + it.next().value + it.next().value + it.next().value;
render(label + ':' + total + ':' + repeated);`
  };

  const sourceBytes = Buffer.byteLength(Object.values(files).join(''));
  const binary = await M.compileToBinary({ files, entry: '/index.html' }, { type: 'source', format: 'mapp' });
  const run = await M.executeBinary(binary);
  const app = M.decodeUnifiedApp(binary);
  const web = M.decodeWebBinary(app.webBinary);

  assert.strictEqual(M.magicOf(binary), 'MAPP');
  assert.strictEqual(run.ok, true);
  assert.strictEqual(run.web.document.getElementById('chat').textContent, 'BH:48:hi there');
  assert.strictEqual(run.web.document.getElementById('out').textContent, 'BH:48:hi there');
  assert.strictEqual(run.web.document.getElementById('dash').getAttribute('awts-mode'), 'live');
  assert.strictEqual(run.web.document.getElementById('dash').dataset.blessing, 'hi there');
  assert.strictEqual(run.web.document.getElementById('row4').tagName, 'AWTS-ROW');
  assert.strictEqual(run.web.document.getElementById('dash').style.transform, 'calc(100% - 7em)');
  assert.strictEqual(run.web.document.getElementById('send').style.backgroundColor, 'rgb(0, 255, 0)');

  console.log(JSON.stringify({
    ok: true,
    sourceBytes,
    compiledBytes: binary.length,
    savedBytes: sourceBytes - binary.length,
    savedPercent: Number(((1 - binary.length / sourceBytes) * 100).toFixed(1)),
    runtime: {
      chat: run.web.document.getElementById('chat').textContent,
      out: run.web.document.getElementById('out').textContent,
      dashAttrs: run.web.document.getElementById('dash').attributes,
      dashDataset: run.web.document.getElementById('dash').dataset,
      row4Tag: run.web.document.getElementById('row4').tagName,
      dashStyle: run.web.document.getElementById('dash').style,
      sendStyle: run.web.document.getElementById('send').style
    },
    compiled: {
      webOps: web.ops.length,
      webPool: web.pool,
      scripts: app.scripts.map(s => ({ name: s.name, kind: s.kind, binaryBytes: s.binary ? s.binary.length : 0 }))
    }
  }, null, 2));
})().catch(error => { console.error(error.stack || error.message); process.exit(1); });
