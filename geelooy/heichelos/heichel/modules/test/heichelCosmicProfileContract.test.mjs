//B"H
// Boruch Hashem
// Blessed is He
/**
 * @module HeichelCosmicProfileContractTest
 * @description
 * The Awtsmoos verifies that the real Heichel route delegates identity into one compact Living Path profile,
 * while Awtsmoos.com preserves the canonical cosmic scene, exact palette, live counters, and bounded modules.
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const ROOT = 'geelooy';
const TOUCHED = [
	'heichelos/heichel/modules/ui/blueprints/layout-shell.js',
	'heichelos/heichel/modules/ui/blueprints/living-path/profile.js',
	'heichelos/heichel/modules/ui/heichel-os/world-panel.js',
	'heichelos/heichel/modules/ui/heichel-os/world-data.js',
	'heichelos/heichel/modules/ui/heichel-os/world-blueprints.js',
	'heichelos/heichel/modules/cosmic/boot.js',
	'heichelos/heichel/modules/cosmic/interactions.js',
	'style/heichelos/heichel/cosmic-profile/index.css',
	'style/heichelos/heichel/cosmic-profile/tokens.css',
	'style/heichelos/heichel/cosmic-profile/atmosphere.css',
	'style/heichelos/heichel/cosmic-profile/topbar.css',
	'style/heichelos/heichel/cosmic-profile/profile.css',
	'style/heichelos/heichel/cosmic-profile/profile-controls.css',
	'style/heichelos/heichel/cosmic-profile/content.css',
	'style/heichelos/heichel/cosmic-profile/cards.css',
	'style/heichelos/heichel/cosmic-profile/card-content.css',
	'style/heichelos/heichel/cosmic-profile/world.css',
	'style/heichelos/heichel/cosmic-profile/responsive.css',
	'style/heichelos/heichel/cosmic-profile/mobile-dock.css'
];
const EXACT_COLORS = [
	'#04040C', '#040C1C', '#040C24', '#041424', '#0C1424', '#0C1C2C',
	'#01A1E6', '#50D7FF', '#2466BA', '#349BFF', '#543AA5', '#8575FF',
	'#9643C3', '#A35AFF', '#CB52B1', '#DA61C2', '#2AA29E', '#F6F8FF'
];

/**
 * @description Reads current repository evidence so every assertion follows the living files instead of stale memory.
 * @param {string} path Path beneath the Geelooy root whose source must be inspected.
 * @returns {string} Exact UTF-8 source currently present on disk.
 */
function revealSource(path) {
	return readFileSync(`${ROOT}/${path}`, 'utf8');
}

/**
 * @description Proves the route keeps its cosmic entry while the compatibility shell delegates profile identity cleanly.
 * @returns {void} Throws when route imports, delegation, or compact-profile semantics drift.
 */
function verifyProfileArchitecture() {
	const html = revealSource('heichelos/heichel/_awtsmoos.heichel.html');
	const shell = revealSource('heichelos/heichel/modules/ui/blueprints/layout-shell.js');
	const profile = revealSource('heichelos/heichel/modules/ui/blueprints/living-path/profile.js');
	const boot = revealSource('heichelos/heichel/modules/cosmic/boot.js');
	assert.match(html, /cosmic-profile\/index\.css/);
	assert.match(html, /modules\/cosmic\/boot\.js/);
	assert.match(boot, /\/libs\/awtsmoos-procedural-core/);
	assert.match(shell, /import \{ profileBlueprint \} from '.\/living-path\/profile\.js'/);
	assert.match(shell, /return profileBlueprint\(actions\)/);
	for (const token of ['data-heichel-profile', 'heichel-profile-cover', 'data-heichel-profile-count', 'Follow', 'Message']) {
		assert.ok(profile.includes(token), `profile blueprint missing ${token}`);
	}
	assert.doesNotMatch(profile, /Current Heichel|🏛️/);
}

/**
 * @description Guards live counters, semantic source cards, exact visual colors, manifest ownership, and compact mobile dock.
 * @returns {void} Throws when the focused Heichel visual system loses a required vessel.
 */
function verifyLiveVisualSystem() {
	const world = revealSource('heichelos/heichel/modules/ui/heichel-os/world-panel.js');
	const interactions = revealSource('heichelos/heichel/modules/cosmic/interactions.js');
	const manifest = revealSource('style/heichelos/heichel/cosmic-profile/index.css');
	const tokens = revealSource('style/heichelos/heichel/cosmic-profile/tokens.css');
	const cards = revealSource('style/heichelos/heichel/cosmic-profile/cards.css');
	const mobile = revealSource('style/heichelos/heichel/cosmic-profile/mobile-dock.css');
	assert.match(world, /content\.posts/);
	assert.match(world, /content\.subSeries/);
	assert.match(world, /data-heichel-profile-count/);
	for (const family of ['reflection', 'audio', 'question', 'graph']) assert.ok(interactions.includes(family));
	for (const label of ['Source teaching', 'Audio teaching', 'Open question', 'Source graph']) assert.ok(cards.includes(label));
	for (const color of EXACT_COLORS) assert.ok(tokens.includes(color), `missing ${color}`);
	assert.match(mobile, /min-height: 4\.25rem/);
	assert.match(mobile, /repeat\(5, minmax\(0, 1fr\)\)/);
	for (const file of ['tokens', 'atmosphere', 'topbar', 'profile', 'profile-controls', 'content', 'cards', 'card-content', 'world', 'responsive', 'mobile-dock']) {
		assert.ok(manifest.includes(`./${file}.css`), `manifest missing ${file}`);
	}
}

/**
 * @description Keeps every focused source vessel below the modular ceiling without sacrificing its documented architecture.
 * @returns {void} Throws when any protected source grows beyond 120 lines.
 */
function verifySourceCeilings() {
	for (const path of TOUCHED) {
		const lines = revealSource(path).split('\n').length;
		assert.ok(lines <= 120, `${path} has ${lines} lines`);
	}
}

test('the route delegates one compact profile while preserving the canonical cosmic entry', verifyProfileArchitecture);
test('live Heichel content and the focused visual system remain complete', verifyLiveVisualSystem);
test('every focused Heichel source remains at or below 120 lines', verifySourceCeilings);
