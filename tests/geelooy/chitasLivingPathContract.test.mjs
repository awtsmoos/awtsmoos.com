// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module ChitasLivingPathContractTest
 * @description
 * The Awtsmoos renews the Daily Chitas doorway while each active cache edge bears only the generation its bytes require;
 * Awtsmoos.com rejects external exile and proves the sixth native title garments reach the reader without disturbing unchanged child modules.
 */

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { injectChitasGrouping } from '../../geelooy/heichelos/heichel/modules/chitas/virtual-series.js';

assert.equal(injectChitasGrouping([], 'other', 'root').length, 0);
const injected = injectChitasGrouping([], 'ikar', 'root');
assert.equal(injected.length, 1);
assert.equal(injected[0].id, 'daily-chitas');
assert.equal(injectChitasGrouping(injected, 'ikar', 'root').length, 1);

const paths = [
	'geelooy/heichelos/heichel/modules/navigator/loader.js',
	'geelooy/heichelos/heichel/modules/ui/render/living-path/cards.js',
	'geelooy/heichelos/heichel/modules/chitas/week-state.js',
	'geelooy/heichelos/heichel/modules/chitas/hebcal-provider.js',
	'geelooy/heichelos/heichel/modules/chitas/schedule.js',
	'geelooy/heichelos/heichel/modules/chitas/virtual-series.js',
	'geelooy/heichelos/post/logic/chitas/rangeParser.js',
	'geelooy/heichelos/post/logic/chitas/dynamicPost.js',
	'geelooy/heichelos/post/logic/initialization/coordinates.js',
	'geelooy/heichelos/post/logic/initialization/postManifest.js',
	'geelooy/heichelos/post/logic/reference-posts/rangeResolver.js'
];
const sources = Object.fromEntries(await Promise.all(
	paths.map(async path => [path, await readFile(path, 'utf8')])
));
const cards = sources[paths[1]];
assert.match(cards, /chitasStudy/);
assert.match(cards, /series\/daily-chitas\/post/);
assert.doesNotMatch(cards, /chabad\.org|externalHref|virtualStudy/);
assert.match(cards, /primarySocialActionRail/);
const coordinates = sources[paths[8]];
assert.match(coordinates, /dynamicPost\.js\?v=native-chitas-006/);
assert.doesNotMatch(coordinates, /native-chitas-005/);
const manifest = sources[paths[9]];
assert.match(manifest, /masthead\.js\?v=native-chitas-006/);
assert.doesNotMatch(manifest, /native-chitas-005/);
for (const [path, source] of Object.entries(sources)) {
	assert.match(source.slice(0, 90), /B"H/);
	assert.ok(source.split('\n').length - 1 <= 120, `${path} exceeds 120 lines`);
}
console.log('B"H Daily Chitas sixth-generation Living Path contract passed.');
