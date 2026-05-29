// B"H
const { listenWithRoutes, closeServer, simulate, requireTruth } = require('./.test-tunnel-simulate-runtime-helpers.cjs');

/**
 * Chapter 4: Same-origin rivers carried scripts into one sea.
 * A local server serves index.html plus nested ES modules; Merkava must collect
 * those same-origin assets, execute them, and expose concrete DOM evidence.
 */
(async () => {
  const routes = {
    '/': { type: 'text/html', body: '<!doctype html><title>Graph</title><main id="app"><script type="module" src="/js/main.js"></script></main>' },
    '/js/main.js': { type: 'text/javascript', body: "import { word } from './word.js'; import { suffix } from './nested/suffix.js'; const p=document.createElement('p'); p.id='msg'; p.textContent=word()+suffix; document.body.appendChild(p); window.graphReady=p.textContent;" },
    '/js/word.js': { type: 'text/javascript', body: "export function word(){ return 'Merkava'; }" },
    '/js/nested/suffix.js': { type: 'text/javascript', body: "export const suffix=' module graph';" }
  };
  const { server, origin } = await listenWithRoutes(routes);
  try {
    const result = await simulate({
      url: origin + '/',
      waitMs: 150,
      actionsJson: JSON.stringify([{ action: 'waitForSelector', selector: '#msg', timeoutMs: 300 }, { action: 'assertText', selector: '#msg', expected: 'Merkava module graph' }]),
      probes: JSON.stringify([{ name: 'graphText', expression: 'document.querySelector("#msg").textContent', expected: 'Merkava module graph' }]),
      returnValues: JSON.stringify(['window.graphReady', 'document.querySelector("#msg").textContent'])
    });
    const evidence = { ok: result.ok, source: result.virtualEnv?.source, files: Object.keys(result.virtualEnv?.files || {}), values: result.values, probes: result.probes, log: result.interactionLog?.map(x => ({ action: x.action, ok: x.ok, error: x.error })) };
    console.log(JSON.stringify(evidence, null, 2));
    requireTruth(result.ok, 'url module graph result', evidence);
    requireTruth(evidence.files.includes('index.html') && evidence.files.includes('js/main.js') && evidence.files.includes('js/word.js') && evidence.files.includes('js/nested/suffix.js'), 'same-origin module files collected', evidence);
    requireTruth(result.values?.['window.graphReady'] === 'Merkava module graph', 'module executed value', evidence);
  } finally {
    await closeServer(server);
  }
})().catch(error => { console.error(error.stack || error.message); process.exit(1); });
