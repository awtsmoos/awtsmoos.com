// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module HeichelMobileUiRepairContract
 * @description
 * The Awtsmoos turns screenshot wounds into durable gates while Awtsmoos.com
 * lets only the custom-tool branch advance to twelve, preserving repaired and unrelated cache vessels without false uniformity.
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { relatedRecordsForView } from '../../geelooy/heichelos/heichel/modules/living-path/discovery-policy.js';
import { injectChitasGrouping } from '../../geelooy/heichelos/heichel/modules/chitas/virtual-series.js';

const read = file => readFileSync(file, 'utf8');
const branches = [{ id: 'written' }, { id: 'oral' }];

assert.deepEqual(relatedRecordsForView({ subSeries: branches }, 'groupings'), []);
assert.deepEqual(relatedRecordsForView({ subSeries: branches }, 'posts'), []);
assert.deepEqual(relatedRecordsForView({ subSeries: branches }, 'series'), branches);
const groupings = injectChitasGrouping([], 'ikar', 'root');
assert.equal(groupings.length, 1);
assert.equal(groupings[0].id, 'daily-chitas');
assert.equal(groupings[0].type, 'grouping');

const navigator = read('geelooy/heichelos/heichel/modules/navigator.js');
const renderer = read('geelooy/heichelos/heichel/modules/ui/render/living-path/path-renderer.js');
const events = read('geelooy/heichelos/heichel/modules/events.js');
const panelStyles = read('geelooy/heichelos/heichel/modules/ui/platform/PlatformPanelStyles.js');
const desktopCss = read('geelooy/heichelos/heichel/styles/platform-panel-v3.css');
const mobileCss = read('geelooy/heichelos/heichel/styles/platform-panel-mobile-v3.css');
const bridge = read('geelooy/heichelos/heichel/bootBridge.js');
const app = read('geelooy/heichelos/heichel/app.js');
const html = read('geelooy/heichelos/heichel/_awtsmoos.heichel.html');
const context = read('geelooy/heichelos/heichel/modules/living-path/context-controller.js');

assert.match(navigator, /this\.livingPath\.afterViewChange\(\)/);
assert.match(renderer, /current\.id === 'root' && !parent/);
assert.match(renderer, /classList\.toggle\('hidden', rootOnly\)/);
assert.match(events, /querySelector\('\.geelooy-main-stage'\)/);
assert.doesNotMatch(events, /mountPlatformPanel\(\{\s*root:\s*document\.body/);
assert.match(desktopCss, /position:\s*fixed/);
assert.match(mobileCss, /@media \(max-width: 38\.75rem\)/);
assert.match(mobileCss, /position:\s*relative/);
assert.match(mobileCss, /inline-size:\s*100%/);
assert.doesNotMatch(mobileCss, /position:\s*fixed/);
assert.match(panelStyles, /platform-panel-mobile-v3\.css\?v=heichel-mobile-007/);
assert.match(html, /app\.js\?v=heichel-mobile-012/);
assert.match(bridge, /app\.js\?v=heichel-mobile-012/);
assert.match(app, /navigator\.js\?v=heichel-mobile-012/);
assert.match(navigator, /living-path\/controller\.js\?v=heichel-mobile-012/);
assert.match(context, /custom-page-mode\.js\?v=heichel-mobile-012/);
assert.match(navigator, /navigator\/loader\.js\?v=heichel-mobile-011/);

for (const file of [
	'geelooy/heichelos/heichel/modules/living-path/context-controller.js',
	'geelooy/heichelos/heichel/modules/living-path/controller.js',
	'geelooy/heichelos/heichel/modules/navigator.js',
	'geelooy/heichelos/heichel/modules/ui/custom-page-mode.js',
	'geelooy/heichelos/heichel/bootBridge.js',
	'geelooy/heichelos/heichel/app.js'
]) {
	const source = read(file);
	assert.ok(source.split('\n').length - 1 <= 120, `${file} exceeds 120 lines`);
	assert.match(source, /^\/\/ B"H/);
}

console.log('B"H Heichel mobile UI repair contract passed.');
