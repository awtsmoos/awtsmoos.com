// B"H
/**
 * Static covenant for Phase 6: each Heichel becomes an OS district surface.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const layout = readFileSync('geelooy/heichelos/heichel/modules/ui/blueprints/main-layout.js', 'utf8');
const render = readFileSync('geelooy/heichelos/heichel/modules/ui/render.js', 'utf8');
const ui = readFileSync('geelooy/heichelos/heichel/modules/ui.js', 'utf8');
const loader = readFileSync('geelooy/heichelos/heichel/modules/navigator/loader.js', 'utf8');
const panel = readFileSync('geelooy/heichelos/heichel/modules/ui/heichel-os/world-panel.js', 'utf8');
const css = readFileSync('geelooy/style/heichelos/revamped-partials/heichel-os-world.css', 'utf8');
const cssEntry = readFileSync('geelooy/style/heichelos/heichel/index.css', 'utf8');

for (const token of ['heichelWorldPanel', 'contentPanel(actions)']) {
  assert.ok(layout.includes(token), `layout missing ${token}`);
}
assert.ok(panel.includes('heichel-os-world-panel'), 'district panel missing heichel-os-world-panel');
for (const token of ['Overview', 'Timeline', 'Knowledge', 'People', 'Assets', 'Events', 'Moderation', 'Graph', 'Storage']) {
  assert.ok(panel.includes(token), `district panel missing ${token}`);
}
for (const token of ['renderHeichelWorldState', 'activateDistrict']) {
  assert.ok(render.includes(token), `render missing ${token}`);
}
assert.ok(ui.includes('export function renderHeichelWorldState'), 'ui aggregator must export renderHeichelWorldState');
assert.ok(loader.includes('ui.renderHeichelWorldState'), 'loader must update heichel os world state');
for (const token of ['.heichel-os-world-panel', '.heichel-os-district-buttons', '.heichel-os-status-grid', '.heichel-os-district-viewport']) {
  assert.ok(css.includes(token), `css missing ${token}`);
}
assert.ok(cssEntry.includes('../revamped-partials/heichel-os-world.css'), 'heichel css entry must import heichel OS world css');
console.log('B"H heichelOsWorldContract.test passed');
