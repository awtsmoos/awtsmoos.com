#!/usr/bin/env node
// B"H — portable, advisory CSS inspection; never gates deployment.
import { readdir, readFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { runPipeline } from './pipeline.mjs';
const root = resolve(process.argv[2] || process.cwd());
const sources = [];
const ignored = new Set(['node_modules', '.git', '.next', 'dist', 'build']);
async function scan(dir) {
  for (const item of await readdir(dir, { withFileTypes: true })) {
    if (item.isSymbolicLink()) continue;
    const path = join(dir, item.name);
    if (item.isDirectory() && !ignored.has(item.name)) await scan(path);
    else if (item.isFile() && item.name.toLowerCase().endsWith('.css'))
      sources.push({ path, content: await readFile(path, 'utf8') });
  }
}
try {
  await scan(root);
  const result = await runPipeline({ cssSources: sources, mode: 'fail-open' });
  const suggestions = result.layerResults.flatMap(layer => {
    const detail = layer.detail || {};
    return (detail.summary?.findings || []).map(finding => ({ layer: layer.layer, ...finding }));
  });
  console.log(JSON.stringify({ ok: result.ok, advisory: true, blocked: false, root, filesChecked: sources.length, layers: result.layerResults, suggestions }, null, 2));
} catch (error) {
  console.error(JSON.stringify({ ok: false, advisory: true, error: error.message }));
  process.exitCode = 1;
}
