// B"H
(async () => {
  const m = await import('./merkava-service/index.js');
  const files = {
    'index.html': '<body><script type="module" src="./index.js"></script></body>',
    'index.js': `
      window.__awtsmoosResult = { phases: ['start'] };
      import('./ckidsAwtsmoos/Olam/uiManager/ui/mainMenu/index.js?v=wide-platform-real-boot-chain-20260529-bh75').then(module => {
        const menu = module.default;
        window.__awtsmoosResult = {
          phases: ['then'],
          isArray: Array.isArray(menu),
          length: menu && menu.length,
          types: (menu || []).map(x => x == null ? 'null' : typeof x),
          keys: (menu || []).map(x => x && Object.keys(x)),
          childTypes: (menu || []).map(x => Array.isArray(x?.children) ? x.children.map(y => y == null ? 'null' : typeof y) : null)
        };
      }).catch(error => { window.__awtsmoosResult.phases.push('catch'); window.__awtsmoosResult.error = error.message; });
    `
  };
  const r = await m.simulateRuntime({ url: 'http://localhost:8080/games/mitzvahWorld/?v=mainmenu-shape', files, entry: 'index.html', waitMs: 1200, maxDynamicFiles: 220, returnValues: ['window.__awtsmoosResult','window.__AWTSMOOS_CAPTURED_ERRORS__'] });
  console.log(JSON.stringify({ ok: r.ok, errors: r.errors?.map(e => e.message), result: r.values['window.__awtsmoosResult'], captured: r.values['window.__AWTSMOOS_CAPTURED_ERRORS__'] }, null, 2));
})().catch(error => { console.error(error.stack || error.message); process.exit(1); });
