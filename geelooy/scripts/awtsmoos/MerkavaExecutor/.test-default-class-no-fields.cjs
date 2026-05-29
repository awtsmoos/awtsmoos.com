// B"H
(async () => {
  const m = await import('./merkava-service/index.js');
  const files = {
    'index.html': '<body><script type="module" src="./index.js"></script></body>',
    'index.js': `
      window.__awtsmoosResult = { phases: ['outer:start'] };
      import('./klass.js').then(module => {
        window.__awtsmoosResult.phases.push('then');
        window.__awtsmoosResult.defaultType = typeof module.default;
        const item = new module.default('fire');
        window.__awtsmoosResult.item = { made: item.made, proto: typeof item.method, method: item.method && item.method() };
      }).catch(error => { window.__awtsmoosResult.phases.push('catch'); window.__awtsmoosResult.error = error.message; });
    `,
    'klass.js': `
      export default class Vessel {
        constructor(name) { this.made = name; }
        method() { return 'method-lit'; }
      }
    `
  };
  const r = await m.simulateRuntime({ files, entry: 'index.html', waitMs: 800, returnValues: ['window.__awtsmoosResult', 'window.__AWTSMOOS_CAPTURED_ERRORS__'] });
  console.log(JSON.stringify({ ok: r.ok, errors: r.errors, result: r.values['window.__awtsmoosResult'], captured: r.values['window.__AWTSMOOS_CAPTURED_ERRORS__'] }, null, 2));
})().catch(error => { console.error(error.stack || error.message); process.exit(1); });
