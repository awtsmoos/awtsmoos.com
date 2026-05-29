// B"H
(async () => {
  const m = await import('./merkava-service/index.js');
  const files = {
    'index.html': '<body><script type="module" src="./index.js"></script></body>',
    'index.js': `
      window.__awtsmoosResult = { phases: ['start'] };
      import('./ckidsAwtsmoos/Olam/uiManager/index.js?v=wide-platform-real-boot-chain-20260529-bh75').then(module => {
        window.__awtsmoosResult.phases.push('then');
        window.__awtsmoosResult.keys = Object.keys(module || {});
        try {
          const manager = new module.default();
          window.__awtsmoosResult.constructed = true;
          window.__awtsmoosResult.hasUI = typeof manager.UI;
          const ui = manager.UI({});
          window.__awtsmoosResult.uiMade = !!ui;
          window.__awtsmoosResult.ikar = !!ui.$g('ikar');
        } catch (error) { window.__awtsmoosResult.constructError = error.message; }
      }).catch(error => { window.__awtsmoosResult.phases.push('catch'); window.__awtsmoosResult.error = error.message; });
    `
  };
  const r = await m.simulateRuntime({ url: 'http://localhost:8080/games/mitzvahWorld/?v=uimanager-test', files, entry: 'index.html', waitMs: 1200, maxDynamicFiles: 200, returnValues: ['window.__awtsmoosResult','window.__AWTSMOOS_CAPTURED_ERRORS__'] });
  console.log(JSON.stringify({ ok: r.ok, errors: r.errors?.map(e=>e.message), result: r.values['window.__awtsmoosResult'], captured: r.values['window.__AWTSMOOS_CAPTURED_ERRORS__'] }, null, 2));
})().catch(error => { console.error(error.stack || error.message); process.exit(1); });
