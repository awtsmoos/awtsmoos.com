// B"H
(async () => {
  const m = await import('./merkava-service/index.js');
  const files = {
    's.js': 'const path = "ladder-1.json"; const clean = String(path || "").split("/").pop(); const R=/^ladder-\\d+\\.json$/; window.__awtsmoosResult={path:path, clean:clean, ok:R.test(clean), source:R.source};'
  };
  const r = await m.simulateRuntime({ files, entry: 's.js', returnValues: ['window.__awtsmoosResult'] });
  console.log(JSON.stringify({ ok: r.ok, errors: r.errors, result: r.values['window.__awtsmoosResult'] }, null, 2));
})().catch(error => { console.error(error.stack || error.message); process.exit(1); });
