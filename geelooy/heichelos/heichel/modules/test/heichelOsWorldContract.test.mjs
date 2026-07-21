// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module HeichelOsWorldContractTest
 * @description
 * The Awtsmoos verifies the split district blueprint, live state painter, and
 * cosmic world surface without depending on obsolete monolithic source strings.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = path => readFileSync(path, 'utf8');
const layout = read('geelooy/heichelos/heichel/modules/ui/blueprints/main-layout.js');
const render = read('geelooy/heichelos/heichel/modules/ui/render.js');
const ui = read('geelooy/heichelos/heichel/modules/ui.js');
const loader = read('geelooy/heichelos/heichel/modules/navigator/loader.js');
const panel = read('geelooy/heichelos/heichel/modules/ui/heichel-os/world-panel.js');
const blueprints = read('geelooy/heichelos/heichel/modules/ui/heichel-os/world-blueprints.js');
const data = read('geelooy/heichelos/heichel/modules/ui/heichel-os/world-data.js');
const css = read('geelooy/style/heichelos/heichel/cosmic-profile/world.css');
const cssEntry = read('geelooy/style/heichelos/heichel/cosmic-profile/index.css');

assert.match(layout, /contentPanel\(actions, filterButtonRef\)/);
assert.match(layout, /heichelWorldPanel\(actions\)/);
assert.match(blueprints, /heichel-os-world-panel/);
for (const token of [
	'Overview', 'Timeline', 'Knowledge', 'People', 'Assets',
	'Events', 'Moderation', 'Graph', 'Storage'
]) {
	assert.ok(data.includes(token), `district data missing ${token}`);
}
for (const token of ['renderHeichelWorldState', 'activateDistrict']) {
	assert.ok(render.includes(token), `render missing ${token}`);
	assert.ok(panel.includes(token), `world panel missing ${token}`);
}
assert.ok(ui.includes('export function renderHeichelWorldState'));
assert.ok(loader.includes('ui.renderHeichelWorldState'));
for (const token of [
	'.heichel-os-world-panel',
	'.heichel-os-district-buttons',
	'.heichel-os-status-grid',
	'.heichel-os-district-viewport'
]) {
	assert.ok(css.includes(token), `cosmic world css missing ${token}`);
}
assert.match(cssEntry, /world\.css/);
console.log('B"H heichelOsWorldContract.test passed');
