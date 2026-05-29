// B"H
(async () => {
  const m = await import('./merkava-service/index.js');
  const files = {
    'index.html': '<body><script type="module" src="./s.js"></script></body>',
    's.js': `
      const LADDER_JSON = /^ladder-\\d+\\.json$/;
      function probe(raw) {
        const clean = String(raw || '').split('/').pop();
        return {
          directType: Object.prototype.toString.call(LADDER_JSON),
          isRegExp: LADDER_JSON instanceof RegExp,
          source: LADDER_JSON && LADDER_JSON.source,
          direct: /^ladder-\\d+\\.json$/.test(clean),
          captured: LADDER_JSON.test(clean),
          clean
        };
      }
      window.__awtsmoosResult = probe(new URLSearchParams(location.search).get('path'));
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
