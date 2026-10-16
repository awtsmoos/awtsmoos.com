//B"H
//Boruch Hashem
//Blessed is He

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const entry = path.resolve(import.meta.dirname, '../app.css');
const imports = /@import\s+(?:url\()?\s*["']([^"']+)["']\s*\)?/g;

/** Validate actual browser-relative imports without reshaping the cascade. */
function walk(file, visited = new Set(), stack = []) {
  const absolute = path.resolve(file);
  assert(!stack.includes(absolute), 'CSS import cycle: ' + [...stack, absolute].map(x=>path.basename(x)).join(' → '));
  assert(fs.existsSync(absolute), 'CSS import missing: ' + absolute);
  if (visited.has(absolute)) return visited;
  visited.add(absolute);
  const content = fs.readFileSync(absolute, 'utf8');
  assert(content.length > 0, 'empty CSS file: ' + absolute);
  for (const match of content.matchAll(imports)) {
    const url = match[1];
    if (/^(?:https?:|data:)/i.test(url)) continue;
    assert(!url.startsWith('/'), 'absolute local CSS URL would bypass app root: ' + url);
    walk(path.resolve(path.dirname(absolute), decodeURI(url.split(/[?#]/)[0])), visited, [...stack, absolute]);
  }
  return visited;
}

test('Tunnel Control CSS import graph resolves without cycles or missing assets', () => {
  const files = walk(entry);
  assert(files.size >= 30, 'unexpectedly incomplete CSS graph');
  console.log(JSON.stringify({suite:'tunnel-control-css-imports',resolvedFiles:files.size,cycles:0,missing:0}));
});
