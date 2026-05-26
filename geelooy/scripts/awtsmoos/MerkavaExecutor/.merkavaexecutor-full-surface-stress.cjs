// B"H
const assert = require('assert');
const MerkavaExecutor = require('./merkavaexecutor.cjs');

(async () => {
  const vmJs = `let total = seed + 12; __awtsmoosResult = total * 3;`;
  const vmResult = await MerkavaExecutor.executeRawJS(vmJs, { globals: { seed: 2 } });
  assert.strictEqual(vmResult.globals.__awtsmoosResult, 42);

  const browserFiles = {
    'index.html': `<!doctype html><html><head><style>#app{display:grid;color:red} .x{color:blue}</style></head><body><button id="go">Go</button><div id="app" class="x"></div><script type="module" src="/main.js"></script></body></html>`,
    '/main.js': `import { value, Maker, gen, typed } from '/lib.js';
      const m = new Maker();
      const it = gen();
      const arr = typed();
      document.getElementById('go').addEventListener('click', () => {
        document.getElementById('app').textContent = String(value + m.run() + it.next().value + it.next().value + arr[1]);
      });
      document.getElementById('go').dispatchEvent(new Event('click'));
      window.__awtsmoosResult = document.getElementById('app').textContent;`,
    '/lib.js': `export const value = 10;
      class Base { run(){ return 7; } }
      export class Maker extends Base { run(){ return super.run() + 5; } }
      export function* gen(){ yield 1; yield 2; }
      export function typed(){ return new Uint8Array([3,4,5]); }`
  };
  const browser = await MerkavaExecutor.executeBrowserFiles(browserFiles, 'index.html', { module: true });
  const browserSnapshot = browser.result?.snapshot?.window || {};
  assert.strictEqual(browser.ok, true);
  assert.strictEqual(browserSnapshot.document?.byId?.app?.textContent || browser.runtime?.window?.document?.getElementById?.('app')?.textContent, '29');

  const nodeFiles = {
    'index.js': `const lib = require('./lib.js'); const txt = api.fs.readFileSync('data.txt','utf8'); api.fs.writeFileSync('out.txt', String(lib.answer + txt.length));`,
    './lib.js': `exports.answer = 40;`,
    'data.txt': 'BH'
  };
  const node = await MerkavaExecutor.executeNodeFiles(nodeFiles, 'index.js');
  assert.strictEqual(node.ok, true);
  assert.strictEqual(node.result.snapshot.files['out.txt'], '42');

  const workerFiles = {
    'worker.js': `addEventListener('message', e => postMessage(e.data + 1)); dispatchMessage(41);`
  };
  const worker = await MerkavaExecutor.executeWorkerFiles(workerFiles, 'worker.js');
  assert.strictEqual(worker.ok, true);
  assert.deepStrictEqual(worker.worker.__messages, [42]);

  const webIr = {
    nodes: [
      { tag: 'main', id: 'app', text: '' },
      { tag: 'button', id: 'go', parent: 'app', text: 'Go' },
      { tag: 'div', id: 'chat', parent: 'app', text: '' }
    ],
    styles: [
      { target: 'app', props: { display: 'grid', gap: 'clamp(4px, 2vw, 16px)', color: 'red', containerType: 'inline-size' } },
      { target: 'chat', props: { color: 'blue', color2: 'gold', background: 'linear-gradient(90deg, red, blue)', transform: 'translate3d(0,0,0)' } }
    ],
    events: [{ target: 'go', on: 'click', do: [{ op: 'setText', target: 'chat', value: 'binary-dom-ok' }, { op: 'emit', name: 'clicked', value: 'yes' }] }]
  };
  const webBin = await MerkavaExecutor.compileToBinary(webIr, { type: 'web' });
  const web = await MerkavaExecutor.executeBinary(webBin);
  assert.strictEqual(MerkavaExecutor.triggerWebEvent(web, 'go', 'click'), true);
  assert.strictEqual(web.document.getElementById('chat').textContent, 'binary-dom-ok');
  assert.strictEqual(web.events[0].name, 'clicked');

  console.log(JSON.stringify({
    ok: true,
    vm: { result: vmResult.globals.__awtsmoosResult },
    browser: { ok: browser.ok, result: '29', hasModuleGraph: !!browser.assembly?.moduleGraph },
    node: { ok: node.ok, out: node.result.snapshot.files['out.txt'] },
    worker: { ok: worker.ok, messages: worker.worker.__messages },
    webBinary: { bytes: webBin.length, chat: web.document.getElementById('chat').textContent, events: web.events }
  }, null, 2));
})().catch(error => {
  console.error(error.stack || error.message);
  process.exit(1);
});
