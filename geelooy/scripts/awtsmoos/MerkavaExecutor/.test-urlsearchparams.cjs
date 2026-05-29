// B"H
(async () => {
  const m = await import('./merkava-service/index.js');
  const files = {
    'index.html': '<body><script type="module" src="./s.js"></script></body>',
    's.js': 'const path = new URLSearchParams(location.search).get("path"); const clean = String(path || "").split("/").pop(); const R=/^ladder-\\d+\\.json$/; window.__awtsmoosResult={href:location.href, search:location.search, path, clean, ok:R.test(clean)};'
  };
  const r = await m.simulateRuntime({ files, entry: 'index.html', url: 'http://localhost:8080/games/mitzvahWorld/?path=ladder-1.json&v=test', returnValues: ['window.__awtsmoosResult'] });
  console.log(JSON.stringify({ ok: r.ok, errors: r.errors, result: r.values['window.__awtsmoosResult'] }, null, 2));
})().catch(error => { console.error(error.stack || error.message); process.exit(1); });
