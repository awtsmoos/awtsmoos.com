// B"H
(async () => {
  const m = await import('./merkava-service/index.js');
  const files = {
    'index.html': '<body><script type="module" src="./index.js"></script></body>',
    'index.js': `
      window.__awtsmoosResult = { phases: ['outer:start'] };
      import('./klass.js').then(module => {
        window.__awtsmoosResult.defaultType = typeof module.default;
        window.__awtsmoosResult.keys = Object.keys(module.default || {});
        const item = new module.default('fire');
        window.__awtsmoosResult.item = { made: item.made, field: item.field, proto: typeof item.method };
      }).catch(error => window.__awtsmoosResult.error = error.message);
    `,
    'klass.js': `
      export default class Vessel {
        field = 'field-lit';
        constructor(name) { this.made = name; }
        method() { return 'method-lit'; }
      }
    `
  };
  const r = await m.simulateRuntime({ files, entry: 'index.html', waitMs: 500, returnValues: ['window.__awtsmoosResult'] });
  console.log(JSON.stringify({ ok: r.ok, errors: r.errors, result: r.values['window.__awtsmoosResult'] }, null, 2));
})().catch(error => { console.error(error.stack || error.message); process.exit(1); });
