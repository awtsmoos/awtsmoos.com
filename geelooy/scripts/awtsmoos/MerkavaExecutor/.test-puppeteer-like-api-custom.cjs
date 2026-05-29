// B"H
/**
 * Puppeteer-like custom-file API stress.
 * Tests page-style interactions on Merkava virtual DOM: selectors, click, fill,
 * waitForSelector, evaluate, content-ish DOM snapshot signals.
 */
(async () => {
  const m = await import('./merkava-service/index.js');
  const files = {
    'index.html': '<body><main id="app"><input id="name"><button id="go">Go</button><div class="out"></div></main><script type="module" src="./index.js"></script></body>',
    'index.js': `
      const input = document.querySelector('#name');
      const button = document.querySelector('#go');
      const out = document.querySelector('.out');
      button.addEventListener('click', () => {
        out.textContent = 'Hello ' + input.value;
        window.__awtsmoosResult = { clicked: true, text: out.textContent, value: input.value };
      });
    `
  };
  const interactions = [
    { type: 'waitForSelector', selector: '#name' },
    { type: 'fill', selector: '#name', text: 'Awtsmoos' },
    { type: 'click', selector: '#go' },
    { type: 'evaluate', expression: 'window.__awtsmoosResult' }
  ];
  const r = await m.simulateRuntime({
    files,
    entry: 'index.html',
    waitMs: 500,
    interactions,
    returnValues: ['window.__awtsmoosResult', 'document.querySelector(".out")?.textContent', 'document.querySelector("#name")?.value']
  });
  console.log(JSON.stringify({
    ok: r.ok,
    errors: (r.errors || []).map(e => e.message),
    interactionLog: r.interactionLog || r.browserActionLog,
    values: r.values,
    valueErrors: r.valueErrors,
    bodyText: r.domSnapshot?.documentElement?.children?.[1]?.textContent
  }, null, 2));
})().catch(error => { console.error(error.stack || error.message); process.exit(1); });
