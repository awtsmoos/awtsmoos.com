// B"H
const assert = require('assert');
const M = require('./merkavaexecutor.cjs');

(async () => {
  const files = {
    '/index.html': `<!doctype html>
<html>
<head>
  <link rel="stylesheet" href="/style.css">
</head>
<body>
  <main id="app">
    <h1 id="title">Loading</h1>
    <section id="chat"></section>
    <button id="send">Send</button>
    <p id="m1">Seed 1</p>
    <p id="m2">Seed 2</p>
    <p id="m3">Seed 3</p>
    <p id="m4">Seed 4</p>
    <p id="m5">Seed 5</p>
    <output id="out"></output>
  </main>
  <script type="module" src="/math.js"></script>
  <script type="module" src="/dom.js"></script>
  <script type="module" src="/main.js"></script>
</body>
</html>`,
    '/style.css': `#app{display:grid;grid-template-columns:1fr 2fr;gap:8px;padding:12px;width:100%;margin-left:7em;transform:calc(100% - 7em);border-radius:12px;box-shadow:0 2px 4px #ff0033;opacity:1;z-index:10;user-select:none;pointer-events:auto}
#title{color:#ff0033;font-size:24px;font-weight:700;line-height:32px;margin-left:10px;text-align:center;text-transform:uppercase}
#send{padding:8px 12px;border-radius:12px;background-color:#00ff00;transition:all 90ms ease;cursor:pointer}
#chat{color:blue;padding:10px;border:1px solid black;min-height:50px;overflow:auto}
#out{color:#ff0033;margin-top:4px}
#m1{color:blue;padding:4px}
#m2{color:blue;padding:4px}
#m3{color:blue;padding:4px}
#m4{color:blue;padding:4px}
#m5{color:blue;padding:4px}`,
    '/math.js': `export class BaseCounter { value(){ return 10; } }
export class Counter extends BaseCounter {
  constructor(){ super(); this.extra = 32; }
  total(){ return super.value() + this.extra; }
}
export function* nums(){ yield 1; yield 2; yield 3; }
export const label = 'BH';`,
    '/dom.js': `export function render(msg){ chat.textContent = msg; out.textContent = msg; }`,
    '/main.js': `import { Counter, nums, label } from '/math.js';
import { render } from '/dom.js';
let c = new Counter();
let it = nums();
let total = c.total() + it.next().value + it.next().value + it.next().value;
render(label + ':' + total);`
  };

  const sourceBytes = Buffer.byteLength(Object.values(files).join(''));
  const binary = await M.compileToBinary({ files, entry: '/index.html' }, { type: 'source' });
  const run = await M.executeBinary(binary);

  assert.strictEqual(M.magicOf(binary), 'MAPP');
  assert.strictEqual(run.ok, true);
  assert.strictEqual(run.web.document.getElementById('chat').textContent, 'BH:48');
  assert.strictEqual(run.web.document.getElementById('out').textContent, 'BH:48');
  assert.strictEqual(run.web.document.getElementById('app').style.transform, 'calc(100% - 7em)');
  assert.strictEqual(run.web.document.getElementById('app').style.width, '100%');
  assert.strictEqual(run.web.document.getElementById('title').style.color, 'rgb(255, 0, 51)');
  assert.strictEqual(run.web.document.getElementById('send').style.backgroundColor, 'rgb(0, 255, 0)');

  console.log(JSON.stringify({
    ok: true,
    magic: M.magicOf(binary),
    sourceBytes,
    compiledBytes: binary.length,
    savedBytes: sourceBytes - binary.length,
    savedPercent: Number(((1 - binary.length / sourceBytes) * 100).toFixed(1)),
    runtime: {
      chat: run.web.document.getElementById('chat').textContent,
      out: run.web.document.getElementById('out').textContent,
      appStyle: run.web.document.getElementById('app').style,
      titleStyle: run.web.document.getElementById('title').style,
      sendStyle: run.web.document.getElementById('send').style
    },
    decoded: {
      webOps: run.app.web.ops.length,
      scripts: run.app.scripts.map(s => ({ name: s.name, kind: s.kind, native: !!s.setText, binaryBytes: s.binary ? s.binary.length : 0 }))
    }
  }, null, 2));
})().catch(error => { console.error(error.stack || error.message); process.exit(1); });
