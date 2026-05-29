// B"H
(async () => {
  const m = await import('./merkava-service/index.js');
  const files = {
    'index.html': '<body><script type="module" src="./s.js"></script></body>',
    's.js': `
      window.__awtsmoosResult = { phases: [] };
      function mark(x) { window.__awtsmoosResult.phases.push(x); }
      async function boot() {
        mark('boot:start');
        await Promise.resolve('ok');
        mark('boot:after-await');
      }
      boot().catch(error => mark('catch:' + error.message));
    `
  };
  const r = await m.simulateRuntime({ files, entry: 'index.html', waitMs: 500, returnValues: ['window.__awtsmoosResult'] });
  console.log(JSON.stringify({ ok: r.ok, errors: r.errors, result: r.values['window.__awtsmoosResult'], console: r.console }, null, 2));
})().catch(error => { console.error(error.stack || error.message); process.exit(1); });
