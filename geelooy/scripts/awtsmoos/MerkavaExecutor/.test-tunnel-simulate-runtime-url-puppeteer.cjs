// B"H
/**
 * Tunnel-level proof: simulateRuntime opens a URL, collects the app into
 * Merkava's synthetic browser, runs Puppeteer-like page actions, and returns
 * real values/handles/errors without Chromium.
 */
const http = require('http');
const { buildActions } = require('../../../apps/tunnel/agent/tools/fs/actions.js');

function listen(server) {
  return new Promise(resolve => server.listen(0, '127.0.0.1', () => resolve(server.address().port)));
}

function close(server) {
  return new Promise(resolve => server.close(resolve));
}

(async () => {
  const server = http.createServer((req, res) => {
    if (req.url === '/app.js') {
      res.setHeader('content-type', 'text/javascript');
      res.end(`
        const input = document.createElement('input');
        input.id = 'name';
        document.body.appendChild(input);
        const btn = document.createElement('button');
        btn.id = 'go';
        btn.className = 'primary action';
        btn.textContent = 'Run';
        btn.addEventListener('click', () => { window.clicked = (input.value || '') + ':clicked'; });
        document.body.appendChild(btn);
        window.booted = true;
      `);
      return;
    }
    res.setHeader('content-type', 'text/html');
    res.end('<!doctype html><title>Tunnel URL Merkava</title><main id="root"><script type="module" src="/app.js"></script></main>');
  });
  const port = await listen(server);
  try {
    const payload = {
      action: 'simulateRuntime',
      url: `http://127.0.0.1:${port}/`,
      waitMs: 150,
      actionsJson: JSON.stringify([
        { action: 'waitForSelector', selector: '#name', timeoutMs: 100 },
        { action: 'fill', selector: '#name', text: 'awtsmoos' },
        { action: 'keyboard', selector: '#name', keyboardAction: 'type', text: '!' },
        { action: 'mouse', selector: '#go', mouseAction: 'click' },
        { action: '$', selector: '#go' },
        { action: '$$', selector: '.action' },
        { action: 'title' },
        { action: 'content' },
        { action: 'click', selector: '#missing', continueOnError: true }
      ]),
      returnValues: JSON.stringify([
        'window.booted',
        'window.clicked',
        'document.querySelector("#name").value',
        'document.querySelectorAll(".action").length'
      ])
    };
    const config = { root: process.cwd(), allowWrite: true, allowSecrets: false, tools: { fsRead: true, fsWrite: true, fsBulk: true, fsList: true } };
    const result = await buildActions(config, payload, null).simulateRuntime();
    const evidence = {
      ok: result.ok,
      source: result.virtualEnv?.source,
      fetched: Object.keys(result.virtualEnv?.files || {}),
      values: result.values,
      actionLog: result.interactionLog?.map(x => ({ action: x.action, ok: x.ok, value: x.value?.kind || x.value?.length || x.value, error: x.error || null, hasStack: !!x.stack })),
      errors: result.errors?.map(e => e.message)
    };
    console.log(JSON.stringify(evidence, null, 2));
    const failures = [];
    if (!result.ok) failures.push('result not ok');
    if (result.virtualEnv?.source !== 'url') failures.push('url was not collected');
    if (!result.virtualEnv?.files?.['index.html']) failures.push('index html missing');
    if (!result.virtualEnv?.files?.['app.js']) failures.push('app js missing');
    if (result.values?.['window.booted'] !== true) failures.push('boot value missing');
    if (result.values?.['window.clicked'] !== 'awtsmoos!:clicked') failures.push('click/keyboard value wrong');
    if (result.values?.['document.querySelector("#name").value'] !== 'awtsmoos!') failures.push('input value wrong');
    if (result.values?.['document.querySelectorAll(".action").length'] !== 1) failures.push('selector count wrong');
    if (!result.interactionLog?.some(x => x.action === '$' && x.value?.kind === 'ElementHandle')) failures.push('element handle missing');
    if (!result.interactionLog?.some(x => x.ok === false && x.continueOnError && x.stack)) failures.push('recoverable error missing stack');
    if (failures.length) { console.error(JSON.stringify({ failures }, null, 2)); process.exit(1); }
  } finally {
    await close(server);
  }
})().catch(error => { console.error(error.stack || error.message); process.exit(1); });
