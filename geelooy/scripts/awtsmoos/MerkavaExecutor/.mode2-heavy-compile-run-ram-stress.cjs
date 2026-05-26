// B"H
const assert = require('assert');
const M = require('./merkavaexecutor.cjs');

function makeHeavyFiles() {
  const rows = Array.from({ length: 12 }, (_, i) => `<awts-row id="row${i + 1}" awts-kind="spark">Seed ${i + 1}</awts-row>`).join('');
  const cards = Array.from({ length: 8 }, (_, i) => `<awts-card id="card${i + 1}" awts-kind="box">Card ${i + 1}</awts-card>`).join('');
  return {
    '/index.html': `<!doctype html><html><head><link rel="stylesheet" href="/style.css"></head><body><main id="app" class="shell" data-kind="root"><h1 id="title">Loading</h1><button id="send" class="primary" data-kind="go" aria-label="Send">Send</button><section id="chat"></section><output id="out"></output>${rows}${cards}</main><script type="module" src="/main.js"></script></body></html>`,
    '/style.css': `@import "/base.css";@import url('/theme.css');#app{display:grid;grid-template-columns:1fr 2fr;gap:8px;padding:12px;width:100%;margin-left:7em;transform:calc(100% - 7em)}button.primary[data-kind="go"]{color:blue;width:100%;border-radius:12px;user-select:none}main:has(awts-row[awts-kind="spark"]){pointer-events:auto}`,
    '/base.css': `@import "/tokens.css";awts-row[awts-kind="spark"]{padding:4px;color:blue}awts-card[awts-kind="box"]{padding:8px;color:blue;border-radius:12px}#chat{margin-left:7em;color:blue}`,
    '/tokens.css': `#title{text-transform:uppercase;font-weight:700}#out{opacity:1;margin-top:4px}`,
    '/theme.css': `.shell{opacity:1;pointer-events:auto}`,
    '/model.js': `export class BaseCounter { value(){ return 10; } } export class Counter extends BaseCounter { constructor(){ super(); this.extra = 32; } total(){ return super.value() + this.extra; } } export function* nums(){ yield 1; yield 2; yield 3; } export const label = 'BH'; export const repeated = 'hi there';`,
    '/view.js': `export function render(msg){ chat.textContent = msg; out.textContent = msg; title.textContent = 'Done'; }`,
    '/worker.js': `export const workerMsg = 'worker-ok'; self.onmessage = event => { self.postMessage(event.data); };`,
    '/main.js': `import { Counter, nums, label, repeated } from '/model.js'; import { render } from '/view.js'; import { workerMsg } from '/worker.js'; let c = new Counter(); let it = nums(); let total = c.total()+it.next().value+it.next().value+it.next().value; render(label+':'+total+':'+repeated+':'+workerMsg);`
  };
}

(async () => {
  const files = makeHeavyFiles();
  const sourceBytes = Buffer.byteLength(Object.values(files).join(''));
  const mode2 = await M.compileToBinary({ files, entry: '/index.html' }, { type: 'source' });
  const legacy = await M.compileToBinary({ files, entry: '/index.html' }, { type: 'source', format: 'mapp' });
  const run = await M.executeBinary(mode2);
  const doc = run.document;
  const arena = M.createMode2ArenaFromSource({ files, entry: '/index.html' });
  const objectShapeBytes = M.estimateObjectShapeBytes({ files, entry: '/index.html' });
  const arenaBytes = arena.bytes.dom + arena.bytes.style + arena.bytes.js + arena.bytes.pool;
  const body = run.app.body.buffer;

  assert.strictEqual(M.magicOf(mode2), 'MD2\0');
  assert.strictEqual(doc.getElementById('chat').textContent, 'BH:48:hi there:worker-ok');
  assert.strictEqual(doc.getElementById('out').textContent, 'BH:48:hi there:worker-ok');
  assert.strictEqual(doc.getElementById('row12').textContent, 'Seed 12');
  assert.strictEqual(doc.getElementById('card8').style.borderRadius, '12px');
  assert.strictEqual(doc.getElementById('app').style.display, 'grid');
  assert.ok(body.includes(M.MODE2_OP.JS_SCOPE_BITS), 'JS_SCOPE_BITS must be used');
  assert.ok(body.includes(M.MODE2_OP.STYLE_STREAM_BITS), 'STYLE_STREAM_BITS must be used');

  const result = {
    ok: true,
    disk: {
      sourceBytes,
      legacyMappBytes: legacy.length,
      mode2Bytes: mode2.length,
      mode2SavedVsSourcePercent: Number(((1 - mode2.length / sourceBytes) * 100).toFixed(1)),
      mode2SavedVsMappPercent: Number(((1 - mode2.length / legacy.length) * 100).toFixed(1))
    },
    ramEstimate: {
      decodedObjectShapeBytes: objectShapeBytes,
      arenaBytes,
      estimatedArenaSavedPercent: Number(((1 - arenaBytes / objectShapeBytes) * 100).toFixed(1)),
      breakdown: arena.bytes,
      domNodes: arena.dom.count,
      styleRules: arena.style.count,
      poolCount: arena.pool.length
    },
    runtime: {
      chat: doc.getElementById('chat').textContent,
      row12: doc.getElementById('row12').textContent,
      card8Style: doc.getElementById('card8').style,
      appStyle: doc.getElementById('app').style,
      jsScopeBits: body.includes(M.MODE2_OP.JS_SCOPE_BITS),
      styleStreamBits: body.includes(M.MODE2_OP.STYLE_STREAM_BITS),
      bodyBytes: body.length
    }
  };
  console.log(JSON.stringify(result, null, 2));
})().catch(error => { console.error(error.stack || error.message); process.exit(1); });
