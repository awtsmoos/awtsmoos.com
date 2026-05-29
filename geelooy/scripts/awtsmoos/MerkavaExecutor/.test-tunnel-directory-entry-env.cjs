// B"H
const fs = require('fs');
const path = require('path');
const { buildActions } = require('../../../apps/tunnel/agent/tools/fs/actions.js');

/**
 * Chapter 83: A single folder opened like a living eye.
 * This stress test gives simulateRuntime only a directory path. The collector
 * must find index.html, then pull CSS, nested CSS imports, CSS url assets,
 * classic JS, module JS, static imports, dynamic import literals, fetch JSON,
 * console output, DOM evidence, and runtime errors into one Merkava-backed run.
 */
function writeFixture(root) {
  fs.rmSync(root, { recursive: true, force: true });
  fs.mkdirSync(path.join(root, 'css'), { recursive: true });
  fs.mkdirSync(path.join(root, 'js', 'nested'), { recursive: true });
  fs.mkdirSync(path.join(root, 'data'), { recursive: true });
  fs.mkdirSync(path.join(root, 'assets'), { recursive: true });
  fs.writeFileSync(path.join(root, 'index.html'), `<!doctype html><title>Directory Palace</title>
    <link rel="stylesheet" href="./css/main.css">
    <main id="app">seed</main>
    <script src="./js/classic.js"></script>
    <script type="module" src="./js/main.js"></script>`, 'utf8');
  fs.writeFileSync(path.join(root, 'css', 'main.css'), `@import './theme.css'; .hero{background:url('../assets/spark.txt')}`, 'utf8');
  fs.writeFileSync(path.join(root, 'css', 'theme.css'), `#app{--awtsmoos:1}`, 'utf8');
  fs.writeFileSync(path.join(root, 'assets', 'spark.txt'), 'spark', 'utf8');
  fs.writeFileSync(path.join(root, 'data', 'message.json'), '{"word":"fetched-json"}', 'utf8');
  fs.writeFileSync(path.join(root, 'js', 'classic.js'), `console.log('classic-start'); window.classicRan = true;`, 'utf8');
  fs.writeFileSync(path.join(root, 'js', 'nested', 'word.js'), `export const word = 'static-word';`, 'utf8');
  fs.writeFileSync(path.join(root, 'js', 'dynamic.js'), `export const dyn = 'dynamic-word';`, 'utf8');
  fs.writeFileSync(path.join(root, 'js', 'main.js'), `import { word } from './nested/word.js';
    console.log('module-start', word);
    const data = await fetch('../data/message.json').then(r => r.json());
    const dyn = await import('./dynamic.js');
    document.querySelector('#app').textContent = word + ':' + dyn.dyn + ':' + data.word;
    window.directoryDone = document.querySelector('#app').textContent;
    try { missingAwtsmoosRuntimeName.value; } catch (error) { console.error('captured-runtime-error', error.message); throw error; }`, 'utf8');
}

(async () => {
  const fixture = path.join(process.cwd(), '.awtsmoos-tmp', 'directory-entry-palace');
  writeFixture(fixture);
  const payload = {
    action: 'simulateRuntime',
    path: path.relative(process.cwd(), fixture),
    waitMs: 250,
    actionsJson: JSON.stringify([{ action: 'waitForSelector', selector: '#app', timeoutMs: 200 }, { action: 'content' }]),
    returnValues: JSON.stringify(['window.classicRan', 'window.directoryDone', 'document.querySelector("#app").textContent', 'window.__AWTSMOOS_CAPTURED_ERRORS__.length'])
  };
  const config = { root: process.cwd(), allowWrite: true, allowSecrets: false, tools: { fsRead: true, fsWrite: true, fsBulk: true, fsList: true } };
  const result = await buildActions(config, payload, null).simulateRuntime();
  const evidence = {
    ok: result.ok,
    source: result.virtualEnv?.source,
    entry: result.virtualEnv?.entry,
    files: Object.keys(result.virtualEnv?.files || {}).sort(),
    values: result.values,
    console: result.console,
    errors: result.errors || result.result?.errors || result.runtimeErrors,
    actionLog: result.interactionLog?.map(x => ({ action: x.action, ok: x.ok, error: x.error || null }))
  };
  console.log(JSON.stringify(evidence, null, 2));
  const failures = [];
  for (const key of ['index.html', 'css/main.css', 'css/theme.css', 'assets/spark.txt', 'js/classic.js', 'js/main.js', 'js/nested/word.js', 'js/dynamic.js', 'data/message.json']) {
    if (!evidence.files.some(file => file.endsWith(key))) failures.push('missing ' + key);
  }
  if (evidence.source !== 'directory') failures.push('directory source not used');
  if (!String(evidence.entry).endsWith('index.html')) failures.push('index html entry not selected');
  if (result.values?.['window.classicRan'] !== true) failures.push('classic script did not run');
  if (result.values?.['document.querySelector("#app").textContent'] !== 'static-word:dynamic-word:fetched-json') failures.push('dom text mismatch');
  if (!JSON.stringify(evidence.console || []).includes('module-start')) failures.push('console evidence missing');
  if (!JSON.stringify(evidence).includes('missingAwtsmoosRuntimeName')) failures.push('runtime error evidence missing');
  if (!result.interactionLog?.some(x => x.action === 'content' && x.ok)) failures.push('content action missing');
  if (failures.length) { console.error(JSON.stringify({ failures }, null, 2)); process.exit(1); }
})().catch(error => { console.error(error.stack || error.message); process.exit(1); });
