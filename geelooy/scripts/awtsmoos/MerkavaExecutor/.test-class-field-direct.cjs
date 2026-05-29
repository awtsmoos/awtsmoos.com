// B"H
(async () => {
  const m = await import('./merkava-service/index.js');
  const files = {
    'index.html': '<body><script type="module" src="./klass.js"></script></body>',
    'klass.js': `
      class Vessel {
        field = 'field-lit';
        constructor(name) { this.made = name; }
        method() { return 'method-lit'; }
      }
      const item = new Vessel('fire');
      window.__awtsmoosResult = { made: item.made, field: item.field, proto: typeof item.method, method: item.method && item.method() };
    `
  };
  const r = await m.simulateRuntime({ files, entry: 'index.html', waitMs: 500, returnValues: ['window.__awtsmoosResult'] });
  console.log(JSON.stringify({ ok: r.ok, errors: r.errors, result: r.values['window.__awtsmoosResult'] }, null, 2));
})().catch(error => { console.error(error.stack || error.message); process.exit(1); });
