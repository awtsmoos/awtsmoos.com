// B"H
import { existsSync, readFileSync, readdirSync, statSync } from 'fs';
import { spawnSync } from 'child_process';
import { extname, resolve } from 'path';

function walk(dir, files = []) {
  if (!existsSync(dir)) return files;
  for (const name of readdirSync(dir)) {
    const path = resolve(dir, name);
    const stat = statSync(path);
    if (stat.isDirectory()) walk(path, files);
    else files.push(path);
  }
  return files;
}

function runNode(args) {
  const result = spawnSync(process.execPath, args, { encoding: 'utf8' });
  return { ok: result.status === 0, status: result.status, stdout: result.stdout.trim(), stderr: result.stderr.trim() };
}

function jsFilesUnder(...dirs) {
  return dirs.flatMap(dir => walk(resolve(process.cwd(), dir))).filter(file => extname(file) === '.js');
}

function test(name, fn) {
  try {
    const result = fn();
    return { name, ok: Boolean(result.ok), ...result };
  } catch (error) {
    return { name, ok: false, error: String(error?.stack || error) };
  }
}

const jsFiles = jsFilesUnder('src', 'js', 'tools');
const allText = jsFiles.map(file => [file.slice(process.cwd().length + 1), readFileSync(file, 'utf8')]);

const results = [
  test('package-json-valid', () => {
    JSON.parse(readFileSync('package.json', 'utf8'));
    return { ok: true };
  }),
  test('import-graph', () => runNode(['tools/verify/importGraph.js'])),
  test('fast-syntax', () => runNode(['tools/verify/fastSyntax.js'])),
  test('legacy-vibe-smoke', () => runNode(['tools/verify/legacyVibeSmoke.js'])),
  test('ai-provider-parity', () => {
    const providers = ['Gemini', 'OpenAI', 'Claude'];
    const hits = Object.fromEntries(providers.map(provider => [provider, allText.filter(([, text]) => text.includes(provider)).map(([file]) => file)]));
    const missing = providers.filter(provider => hits[provider].length === 0);
    return { ok: missing.length === 0, hits, missing };
  }),
  test('no-dynamic-innerHTML-in-vibe-adapters', () => {
    const offenders = allText
      .filter(([file]) => file.startsWith('js/vibe/') || file.startsWith('js/tabs/') || file === 'js/db.js' || file === 'js/fs-provider.js')
      .filter(([file, text]) => text.includes('innerHTML') && !file.endsWith('vibe-view.js') && !file.endsWith('history.js'))
      .map(([file]) => file);
    return { ok: offenders.length === 0, offenders };
  }),
  test('browser-event-guards', () => {
    const files = ['js/tabs/index.js', 'js/vibe/modules/loop/LoopGitPusher.js', 'js/vibe/modules/loop/LoopErrorHandler.js'];
    const missing = files.filter(file => !readFileSync(file, 'utf8').includes('globalThis.document && globalThis.CustomEvent'));
    return { ok: missing.length === 0, missing };
  }),
  test('full-syntax-best-effort', () => {
    const failures = [];
    for (const file of jsFiles) {
      const result = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
      if (result.status !== 0) failures.push({ file: file.slice(process.cwd().length + 1), stderr: result.stderr.slice(0, 1200) });
    }
    return { ok: failures.length === 0, checked: jsFiles.length, failures };
  })
];

const report = {
  at: new Date().toISOString(),
  tests: results.length,
  passed: results.filter(r => r.ok).length,
  failed: results.filter(r => !r.ok).length,
  results
};
console.log(JSON.stringify(report, null, 2));
process.exitCode = report.failed ? 1 : 0;
