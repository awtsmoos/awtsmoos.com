// B"H
(async () => {
  const m = await import('./merkava-service/index.js');
  const files = { 'index.html': '<script type="module" src="./index.js"></script>', 'index.js': `class A { get(x){ return 'got:' + x; } } const a = new A(); window.__awtsmoosResult = { one: a?.get?.('ikar'), two: a?.missing?.('x') || 'fallback' };` };
  const r = await m.simulateRuntime({ files, entry: 'index.html', waitMs: 300, returnValues: ['window.__awtsmoosResult'] });
  console.log(JSON.stringify({ ok: r.ok, errors: r.errors?.map(e => e.message), result: r.values['window.__awtsmoosResult'] }, null, 2));
})().catch(error => { console.error(error.stack || error.message); process.exit(1); });
