// B"H
const assert = require('assert');
const M = require('./merkavaexecutor.cjs');

(async () => {
  const files = {
    '/index.html': `<link rel="stylesheet" href="/style.css"><main id="app" class="shell"><button id="send" class="primary" data-kind="go">Send</button><section id="chat"></section><output id="out"></output><awts-row id="row1" awts-kind="spark">Seed 1</awts-row><awts-row id="row2" awts-kind="spark">Seed 2</awts-row></main>`,
    '/style.css': `button.primary[data-kind="go"]:hover{color:blue;padding:8px;width:100%}
main:has(awts-row[awts-kind="spark"]){margin-left:7em;transform:calc(100% - 7em)}
awts-row[awts-kind="spark"], #send{border-radius:12px}`,
    '/model.js': `export class BaseCounter { value(){ return 10; } }
export class Counter extends BaseCounter { constructor(){ super(); this.extra = 32; } total(){ return super.value() + this.extra; } }
export function* nums(){ yield 1; yield 2; yield 3; }
export const label = 'BH'; export const repeated = 'hi there';`,
    '/view.js': `export function render(msg){ chat.textContent = msg; out.textContent = msg; }`,
    '/main.js': `import { Counter, nums, label, repeated } from '/model.js'; import { render } from '/view.js'; let c = new Counter(); let it = nums(); let total = c.total()+it.next().value+it.next().value+it.next().value; render(label+':'+total+':'+repeated);`
  };
  const html = files['/index.html'];
  const linked = M.collectLinked(html, files, '/index.html');
  const nodes = M.parseHtmlNodes(html);
  const styles = M.parseCss(linked.css);
  const program = M.detectCounterRenderProgram(files);
  const mode = M.encodeModeApp({ nodes, styles, program });
  const mode2 = M.encodeMode2App({ nodes, styles, program });
  const mapp = await M.compileToBinary({ files, entry: '/index.html' }, { type: 'source', format: 'mapp' });
  const run = M.runMode2App(mode2);
  assert.strictEqual(run.document.getElementById('chat').textContent, 'BH:48:hi there');
  assert.strictEqual(run.document.getElementById('out').textContent, 'BH:48:hi there');
  assert.strictEqual(run.document.getElementById('send').style.color, 'blue');
  assert.strictEqual(run.document.getElementById('app').style.marginLeft, '7em');
  assert.strictEqual(run.document.getElementById('row1').style.borderRadius, '12px');
  const sourceBytes = Buffer.byteLength(Object.values(files).join(''));
  console.log(JSON.stringify({ ok: true, sourceBytes, oldMappBytes: mapp.length, modeBytes: mode.length, mode2Bytes: mode2.length, mode2SavedVsSourcePercent: Number(((1-mode2.length/sourceBytes)*100).toFixed(1)), mode2SavedVsMappPercent: Number(((1-mode2.length/mapp.length)*100).toFixed(1)), mode2SavedVsModePercent: Number(((1-mode2.length/mode.length)*100).toFixed(1)), result: run.result, poolCount: run.app.pool.length, selectorCount: run.app.selectors.length }, null, 2));
})().catch(error => { console.error(error.stack || error.message); process.exit(1); });
