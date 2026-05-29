// B"H
(async () => {
  const m = await import('./merkava-service/index.js');
  const files = {
    'index.html': '<body><script type="module" src="./index.js"></script></body>',
    'index.js': `
      const parent = document.createElement('div');
      const child = document.createElement('span');
      parent.appendChild(child);
      window.__awtsmoosResult = { childCount: parent.children.length, firstTag: parent.children[0] && parent.children[0].tagName };
    `
  };
  const r = await m.simulateRuntime({ files, entry: 'index.html', waitMs: 300, returnValues: ['window.__awtsmoosResult'] });
  console.log(JSON.stringify({ ok: r.ok, errors: r.errors?.map(e => e.message), result: r.values['window.__awtsmoosResult'] }, null, 2));
})().catch(error => { console.error(error.stack || error.message); process.exit(1); });
