// B"H
/**
 * @file scrollVisualRegressionGuard.test.mjs
 * @description
 * Native scroll is sovereign. Any visual module in the audited Home, Heichel,
 * and Reader legend zones that reads layout from scroll must use the shared
 * rAF binder, and every scroll listener must be passive.
 */

import fs from 'node:fs';
import path from 'node:path';

const roots = [
  'geelooy/scripts/awtsmoos/social/home',
  'geelooy/heichelos/heichel/modules/beauty',
  'geelooy/heichelos/heichel/modules/legend',
  'geelooy/heichelos/post/logic/beauty',
  'geelooy/heichelos/post/logic/legend',
  'geelooy/heichelos/post/logic/visual'
];

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const file = path.join(dir, entry.name).replace(/\\/g, '/');
    if (entry.isDirectory()) return walk(file);
    return file.endsWith('.js') ? [file] : [];
  });
}

function hasRawScrollListener(source) {
  return /addEventListener\s*\(\s*['"]scroll['"]/.test(source);
}

function hasPassiveScrollListener(source) {
  return /addEventListener\s*\(\s*['"]scroll['"][\s\S]*?passive\s*:\s*true/.test(source);
}

const files = roots.flatMap(walk);
const offenders = [];

for (const file of files) {
  const source = fs.readFileSync(file, 'utf8');
  const readsLayout = source.includes('getBoundingClientRect()');
  const bindsScroll = hasRawScrollListener(source);
  const usesRafBinder = source.includes('bindRafViewportUpdates');

  if (readsLayout && bindsScroll && !usesRafBinder) {
    offenders.push(`${file}: layout read from raw scroll without rAF binder`);
  }
  if (bindsScroll && !hasPassiveScrollListener(source)) {
    offenders.push(`${file}: scroll listener is not visibly passive`);
  }
}

if (offenders.length) throw new Error(offenders.join('\n'));

console.log('B"H scrollVisualRegressionGuard.test passed');
