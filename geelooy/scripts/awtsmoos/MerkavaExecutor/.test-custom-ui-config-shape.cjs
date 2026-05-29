// B"H
(async () => {
  const m = await import('./merkava-service/index.js');
  const source = `
    const css = \`
      .menu { display: grid; }
      .item::after { content: "[x]"; }
    \`;
    const config = [
      {
        shaym: 'ikar',
        children: [
          { tag: 'style', innerHTML: css },
          {
            className: 'menu',
            onclick(event) { window.clicked = event?.type || 'none'; },
            children: [
              { textContent: \`Level \${1 + 1}\` },
              { textContent: ['a', 'b'].map(x => x.toUpperCase()).join('-') }
            ]
          }
        ]
      }
    ];
    window.__awtsmoosResult = {
      length: config.length,
      root: config[0].shaym,
      childCount: config[0].children.length,
      text: config[0].children[1].children[1].textContent,
      cssHasBracket: config[0].children[0].innerHTML.includes('[x]')
    };
  `;
  const r = await m.simulateRuntime({
    files: { 'index.html': '<script type="module" src="./index.js"></script>', 'index.js': source },
    entry: 'index.html',
    waitMs: 200,
    returnValues: ['window.__awtsmoosResult']
  });
  console.log(JSON.stringify({ ok: r.ok, errors: (r.errors || []).map(e => e.message), value: r.values?.['window.__awtsmoosResult'] }, null, 2));
})().catch(error => { console.error(error.stack || error.message); process.exit(1); });
