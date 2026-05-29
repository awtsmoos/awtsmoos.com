// B"H
(async () => {
  const m = await import('./merkava-service/index.js');
  const files = {
    'index.html': '<body><script type="module" src="./s.js"></script></body>',
    's.js': `
      const LADDER_JSON = /^ladder-\\d+\\.json$/;
      const LADDER_JS = /^ladder-\\d+\\.js$/;
      function normalizeLevelId(raw) {
        const clean = String(raw || '').split('/').pop();
        if (LADDER_JS.test(clean)) return clean.replace(/\\.js$/i, '.json');
        if (LADDER_JSON.test(clean)) return clean;
        throw new Error('bad:' + clean);
      }
      const path = new URLSearchParams(location.search).get('path');
      window.__awtsmoosResult = { path, normalized: normalizeLevelId(path) };
    `
  };
  const r = await m.simulateRuntime({
    files,
    entry: 'index.html',
    url: 'http://localhost:8080/games/mitzvahWorld/?path=ladder-1.json&v=test',
    returnValues: ['window.__awtsmoosResult']
  });
  console.log(JSON.stringify({ ok: r.ok, errors: r.errors, result: r.values['window.__awtsmoosResult'] }, null, 2));
})().catch(error => { console.error(error.stack || error.message); process.exit(1); });
