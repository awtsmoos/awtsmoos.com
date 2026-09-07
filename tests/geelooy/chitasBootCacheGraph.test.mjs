// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module ChitasBootCacheGraphTest
 * @description
 * The Awtsmoos carries a narrow twelfth custom-tool edge above the repaired eleventh source-loader river;
 * Awtsmoos.com guards both while native-chitas-003 stays stable, so unrelated Daily Chitas vessels remain serene.
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = path => readFileSync(path, 'utf8');
const template = read('geelooy/heichelos/heichel/_awtsmoos.heichel.html');
const bridge = read('geelooy/heichelos/heichel/bootBridge.js');
const app = read('geelooy/heichelos/heichel/app.js');
const navigator = read('geelooy/heichelos/heichel/modules/navigator.js');
const loader = read('geelooy/heichelos/heichel/modules/navigator/loader.js');
const sourceLoader = read('geelooy/heichelos/heichel/modules/navigator/source-loader.js');
const virtualSeries = read('geelooy/heichelos/heichel/modules/chitas/virtual-series.js');
const schedule = read('geelooy/heichelos/heichel/modules/chitas/schedule.js');

assert.match(template, /bootBridge\.js\?v=heichel-mobile-012/);
assert.match(template, /app\.js\?v=heichel-mobile-012/);
assert.match(bridge, /app\.js\?v=heichel-mobile-012/);
assert.match(app, /navigator\.js\?v=heichel-mobile-012/);
assert.match(navigator, /living-path\/controller\.js\?v=heichel-mobile-012/);
assert.match(navigator, /navigator\/loader\.js\?v=heichel-mobile-011/);
assert.match(loader, /source-loader\.js\?v=heichel-mobile-011/);
assert.match(sourceLoader, /translation-loader\.js\?v=heichel-mobile-011/);
assert.match(sourceLoader, /virtual-series\.js\?v=native-chitas-003/);
assert.match(virtualSeries, /schedule\.js\?v=native-chitas-003/);
assert.match(schedule, /date-policy\.js\?v=native-chitas-003/);
assert.doesNotMatch(
	sourceLoader + virtualSeries + schedule,
	/native-chitas-002|chabadStudyHref|chabad\.org|externalHref/
);

for (const [path, source] of [
	['bootBridge.js', bridge],
	['app.js', app],
	['navigator.js', navigator],
	['loader.js', loader],
	['source-loader.js', sourceLoader],
	['virtual-series.js', virtualSeries],
	['schedule.js', schedule]
]) {
	assert.ok(source.split('\n').length - 1 <= 120, `${path} exceeds the 120-line covenant`);
}

console.log('B"H Chitas boot cache graph contract passed.');
