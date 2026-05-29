// B"H
(async () => {
  const m = await import('./merkava-service/index.js');
  const files = {
    'index.html': '<body><script type="module" src="./index.js"></script></body>',
    'index.js': `
      window.__awtsmoosResult = { phases: ['start'] };
      import('/scripts/awtsmoos/ui/index.js').then(module => {
        window.__awtsmoosResult.phases.push('then');
        window.__awtsmoosResult.keys = Object.keys(module || {});
        window.__awtsmoosResult.defaultType = typeof module.default;
        try {
          const ui = new module.default();
          window.__awtsmoosResult.constructed = true;
          window.__awtsmoosResult.hasEvents = typeof ui.events;
          window.__awtsmoosResult.hasHtml = typeof ui.html;
        } catch (error) { window.__awtsmoosResult.constructError = error.message; }
      }).catch(error => { window.__awtsmoosResult.phases.push('catch'); window.__awtsmoosResult.error = error.message; });
    `
  };
  const r = await m.simulateRuntime({ url: 'http://localhost:8080/games/mitzvahWorld/?v=ui-test', files, entry: 'index.html', waitMs: 1000, maxDynamicFiles: 120, returnValues: ['window.__awtsmoosResult','window.__AWTSMOOS_CAPTURED_ERRORS__'] });
  console.log(JSON.stringify({ ok: r.ok, errors: r.errors?.map(e=>e.message), result: r.values['window.__awtsmoosResult'], captured: r.values['window.__AWTSMOOS_CAPTURED_ERRORS__'] }, null, 2));
})().catch(error => { console.error(error.stack || error.message); process.exit(1); });
