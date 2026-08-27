import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const recorderName = ['Media', 'Recorder'].join('');
const forbidden = [recorderName, ['new ', recorderName].join(''), [recorderName, '.isTypeSupported'].join('')];
const ignoredDirs = new Set(['.git', 'ai-thoughts']);
const checkedExt = new Set(['.js', '.mjs', '.html', '.css', '.md']);
const hits = [];
walk(root);
assert.deepEqual(hits, []);
console.log('B"H active no forbidden recorder guard passed');

function walk(dir) {
  for (const name of readdirSync(dir)) {
    if (ignoredDirs.has(name)) continue;
    const path = join(dir, name), stat = statSync(path);
    if (stat.isDirectory()) walk(path);
    else if (checkedExt.has(ext(name)) && !path.endsWith('053_no_media_recorder_guard_smoke.mjs')) scan(path);
  }
}
function scan(path) {
  const text = readFileSync(path, 'utf8');
  for (const term of forbidden) if (text.includes(term)) hits.push(`${path}: ${term}`);
}
function ext(name) { const i = name.lastIndexOf('.'); return i < 0 ? '' : name.slice(i); }
