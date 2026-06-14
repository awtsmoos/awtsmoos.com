// B"H
/**
 * @file mobileStyleContract.test.mjs
 * @description
 * Chapter 20: The contract now watches buttons, not only colors.
 *
 * CSS and JS must agree on drawer state, and every visible search/filter
 * control must have an action. The Awtsmoos does not tolerate painted silence.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';

function read(file) {
  return readFileSync(file, 'utf8');
}

function cssGraph(entry, seen = new Set()) {
  const normalized = path.normalize(entry).replace(/\\/g, '/');
  if (seen.has(normalized)) return '';
  seen.add(normalized);
  const source = read(normalized);
  const dir = path.dirname(normalized);
  const imported = [...source.matchAll(/@import\s+(?:url\()?['"]([^'")]+)['"]/g)]
    .map(match => match[1])
    .filter(target => target.startsWith('.'))
    .map(target => cssGraph(path.join(dir, target), seen))
    .join('\n');
  return `${source}\n${imported}`;
}

const layout = read('geelooy/heichelos/heichel/modules/ui/blueprints/main-layout.js');
const render = read('geelooy/heichelos/heichel/modules/ui/render.js');
const grids = read('geelooy/heichelos/heichel/modules/ui/render/grids.js');
const css = cssGraph('geelooy/style/heichelos/heichel/index.css');

for (const token of ['geelooy-heichel-hero', 'hero-stats', 'series-search-row', 'tab-gates', 'geelooy-mobile-drawer', 'geelooy-bottom-nav']) {
  assert.ok(layout.includes(token), `layout must emit ${token}`);
  assert.ok(css.includes(`.${token}`), `css must style .${token}`);
}

for (const token of ['nav-card', 'nav-card-media', 'nav-card-body', 'card-menu-spark', 'card-menu-panel']) {
  assert.ok(grids.includes(token), `grid renderer must emit ${token}`);
  assert.ok(css.includes(`.${token}`), `css must style .${token}`);
}

assert.ok(layout.includes('ref: \'filterButton\''), 'filter button must be registered');
assert.ok(layout.includes('events: { click: actions.applyFilter }'), 'filter button must click an action');
assert.ok(render.includes("classList.toggle('sidebar-open')"), 'drawer JS must toggle CSS-owned sidebar-open');
assert.ok(!render.includes("classList.toggle('sidebar-collapsed')"), 'drawer JS must not toggle stale sidebar-collapsed');
assert.ok(css.includes('.geelooy-mobile-drawer a'), 'drawer links must be styled, not raw anchors');
assert.ok(css.includes('.tab.Active'), 'uppercase Active tab class must be covered');
console.log('B"H mobileStyleContract.test passed');
