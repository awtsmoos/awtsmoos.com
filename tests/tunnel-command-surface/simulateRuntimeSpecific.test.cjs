// B"H
const assert = require('assert');
const fs = require('fs');
const { dispatchOsFs } = require('../../geelooy/API/tunnel/control/routes/osFs/index.js');

async function run(name, payload) {
  const started = Date.now();
  let result, error;
  try { result = await dispatchOsFs(null, 'simulate-runtime-specific-test', payload); }
  catch (e) { error = { message: e.message, stack: e.stack }; }
  return {
    name,
    durationMs: Date.now() - started,
    payload,
    ok: result?.ok ?? false,
    keys: result && typeof result === 'object' ? Object.keys(result).sort() : [],
    result,
    error
  };
}

(async () => {
  const tests = [];
  tests.push(await run('few-file-browser-merkava-dom-and-interactions', {
    action: 'simulateRuntime',
    runtime: 'browser',
    engine: 'merkava',
    entry: 'index.html',
    files: {
      'index.html': `<!doctype html><main id="app">BH start</main><input id="box"><button id="btn">Click</button><script src="app.js"></script>`,
      'app.js': `document.getElementById("app").textContent = "BH simulated"; window.__awtsmoosResult = { text: document.getElementById("app").textContent };`
    },
    interactions: [
      { op: 'assertExists', selector: '#btn' },
      { op: 'assertText', selector: '#app', expected: 'BH simulated' },
      { op: 'click', selector: '#btn' },
      { op: 'type', selector: '#box', text: 'abc' },
      { op: 'key', selector: '#box', key: 'Enter' }
    ],
    maxText: 12000
  }));

  tests.push(await run('node-inline-merkava-plain-global', {
    action: 'simulateRuntime',
    runtime: 'node',
    engine: 'merkava',
    entry: 'main.js',
    files: {
      'main.js': `globalThis.__awtsmoosResult = { ok: true, value: 42 };`
    },
    maxText: 12000
  }));

  tests.push(await run('runtimeWorkflow-basic', {
    action: 'runtimeWorkflow',
    runtime: 'browser',
    engine: 'merkava',
    entry: 'index.html',
    files: {
      'index.html': `<main id="app">workflow</main><input id="box"><button id="btn">B</button>`
    },
    steps: [
      { action: 'simulateRuntime', payload: { entry: 'index.html' } }
    ],
    maxText: 12000
  }));

  const out = { generatedAt: new Date().toISOString(), tests };
  fs.mkdirSync('./tests/tunnel-command-surface/reports', { recursive: true });
  fs.writeFileSync('./tests/tunnel-command-surface/reports/simulate-runtime-specific.json', JSON.stringify(out, null, 2));
  console.log(JSON.stringify(out, (k,v)=> typeof v === 'string' && v.length > 2000 ? v.slice(0,2000)+'…' : v, 2));

  assert.equal(tests[0].ok, true, 'browser merkava simulateRuntime should return ok with op interactions');
  assert.equal(tests[0].result.interactionLog.length, 5, 'all five interactions should replay');
  assert.equal(tests[1].ok, true, 'node merkava simulateRuntime should return ok with plain global code');
  assert.equal(tests[2].ok, true, 'runtimeWorkflow should return ok');
})();
