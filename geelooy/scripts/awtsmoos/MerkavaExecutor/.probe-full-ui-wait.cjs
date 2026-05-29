// B"H
(async () => {
  const m = await import('./merkava-service/index.js');
  const r = await m.simulateRuntime({
    url: 'http://localhost:8080/games/mitzvahWorld/?path=ladder-1.json&v=merkava-ui-wait-probe-bh102',
    waitMs: 5000,
    maxUrlFiles: 220,
    maxDynamicFiles: 340,
    returnValues: [
      '!!window.mana',
      '!!window.mana?.ui',
      '!!window.mana?.ui?.$g?.("ikar")',
      '!!window.mana?.ui?.$g?.("main menu")',
      '!!window.awtsmoosGameUI',
      'window.__AWTSMOOS_IKAR_PHASES__',
      'window.__AWTSMOOS_LAST_ERROR_JSON__'
    ]
  });
  console.log(JSON.stringify({ ok: r.ok, errors: (r.errors || []).map(e => e.message), values: r.values }, null, 2));
})().catch(error => { console.error(error.stack || error.message); process.exit(1); });
