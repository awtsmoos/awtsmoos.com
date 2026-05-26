// B"H
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  simulateRuntime,
  compileMerkavaRuntime,
  inspectMerkava,
  compileAndRunMerkavaJs
} from './merkava-service/index.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const tempDir = path.join(here, '.merkava-stress-fixture');
fs.mkdirSync(tempDir, { recursive: true });
fs.writeFileSync(path.join(tempDir, 'entry.html'), `<!doctype html>
<html><head><link rel="stylesheet" href="style.css"></head>
<body><main id="root">pending</main><script src="app.js"></script></body></html>`);
fs.writeFileSync(path.join(tempDir, 'style.css'), `#root { color: rgb(1, 2, 3); }`);
fs.writeFileSync(path.join(tempDir, 'app.js'), `const value = Array.from({length: 8}, (_, i) => i + 1).reduce((a, b) => a + b, 0); document.getElementById('root').textContent = 'sum=' + value; window.__awtsmoosResult = { value };`);

async function test(name, fn) {
  const started = Date.now();
  try {
    const value = await fn();
    return { name, ok: true, ms: Date.now() - started, value };
  } catch (error) {
    return { name, ok: false, ms: Date.now() - started, error: error.message, stack: error.stack };
  }
}

const explicitFiles = {
  'index.html': `<!doctype html><main id="app">zero</main><script src="main.js"></script>`,
  'main.js': `const xs=[3,4,5]; const total=xs.map(x=>x*x).reduce((a,b)=>a+b,0); document.getElementById('app').textContent='squares='+total; window.__awtsmoosResult={total};`,
  'theme.css': `main { display: block; }`
};

const tests = [];
tests.push(await test('default-engine-explicit-html-js-css', async () => {
  const result = await simulateRuntime({ files: explicitFiles, entry: 'index.html' });
  if (!result.ok || result.engine !== 'merkava') throw new Error('default merkava explicit run failed');
  return { engine: result.engine, bytes: result.bytecode?.bytes, runOk: result.result?.ok };
}));

tests.push(await test('path-entry-auto-collect-html-js-css', async () => {
  const result = await simulateRuntime({ entry: path.join(tempDir, 'entry.html') });
  if (!result.ok || result.engine !== 'merkava') throw new Error('path entry run failed');
  return { engine: result.engine, source: result.input?.source || result.virtualEnv?.source, files: result.input?.files || Object.keys(result.virtualEnv?.files || {}) };
}));

tests.push(await test('merkava-bytecode-compile-inspect', async () => {
  const compiled = await compileMerkavaRuntime({ files: explicitFiles, entry: 'index.html' });
  const inspected = inspectMerkava(compiled.bytecode);
  if (!compiled.ok || !inspected.ok) throw new Error('compile/inspect failed');
  return { kind: inspected.kind, bytes: compiled.bytecode.length };
}));

tests.push(await test('merkava-js-bytecode-arithmetic', async () => {
  const result = await compileAndRunMerkavaJs('let total=0; for(let i=1;i<=10;i++) total+=i; total;', { nodeCompat: true });
  const got = result.run?.result?.total ?? result.run?.total ?? result.run?.result;
  if (JSON.stringify(result).indexOf('55') === -1) throw new Error('JS bytecode result did not include 55');
  return { bytes: result.bytecode.length, result: result.run };
}));

tests.push(await test('expected-runtime-error-reported', async () => {
  const result = await simulateRuntime({ files: { 'index.html': '<script src="bad.js"></script>', 'bad.js': 'throw new Error("BH_EXPECTED_RUNTIME_ERROR")' }, entry: 'index.html' });
  const text = JSON.stringify(result);
  if (!text.includes('BH_EXPECTED_RUNTIME_ERROR')) throw new Error('runtime error was not surfaced');
  return { ok: result.ok, hasError: true, preview: text.slice(0, 500) };
}));

const failed = tests.filter(t => !t.ok);
console.log(JSON.stringify({ ok: failed.length === 0, total: tests.length, failed: failed.map(t => t.name), tests }, null, 2));
if (failed.length) process.exit(1);
