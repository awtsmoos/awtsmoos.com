// B"H
(async () => {
  const m = await import('./merkava-service/index.js');
  const files = {
    'index.html': '<body><script type="module" src="./index.js"></script></body>',
    'index.js': `
      window.__awtsmoosResult = { phases: ['start'] };
      import('/scripts/awtsmoos/ui/index.js').then(module => {
        const ui = new module.default();
        const root = ui.html({ shaym: 'ikar', children: [{ tag: 'style', innerHTML: 'body{}' }, { className: 'menu', children: [{ textContent: 'hi' }] }] });
        window.__awtsmoosResult = { phases: ['then'], rootTag: root.tagName, rootChildren: root.children.length, bodyChildren: document.body.children.length, ikar: !!ui.$g('ikar') };
      }).catch(error => { window.__awtsmoosResult.phases.push('catch'); window.__awtsmoosResult.error = error.message; });
    `
  };
  const r = await m.simulateRuntime({ url: 'http://localhost:8080/games/mitzvahWorld/?v=ui-basic', files, entry: 'index.html', waitMs: 800, returnValues: ['window.__awtsmoosResult','window.__AWTSMOOS_CAPTURED_ERRORS__'] });
  console.log(JSON.stringify({ ok: r.ok, errors: r.errors?.map(e => e.message), result: r.values['window.__awtsmoosResult'], captured: r.values['window.__AWTSMOOS_CAPTURED_ERRORS__'] }, null, 2));
})().catch(error => { console.error(error.stack || error.message); process.exit(1); });
