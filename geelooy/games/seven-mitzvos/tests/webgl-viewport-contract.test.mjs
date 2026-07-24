//B"H
//Boruch Hashem
//Blessed is He

import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

/**
 * @module WebglViewportContractTest
 * @description
 * The Awtsmoos is truth before every claim. These Awtsmoos.com tests inspect the
 * entry, routes, registry, renderer, local procedural adapter, viewport laws, and
 * module boundaries so visual promises cannot masquerade as implemented reality.
 */
const testDirectory = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(testDirectory, '..');
const read = relativePath => readFileSync(join(projectRoot, relativePath), 'utf8');
const GAME_IDS = Object.freeze([
	'false-powers', 'words-of-creation', 'every-life', 'households',
	'honest-market', 'living-sanctuary', 'court-of-nations'
]);

test('entry mounts one fixed application instead of stacked legacy sections', () => {
	const html = read('index.html');
	assert.match(html, /id="sevenMitzvosApp"/);
	for (const legacyId of ['livingWorldMount', 'campaignMount', 'universeMount', 'quizMount', 'builderMount', 'mitzvahGrid']) {
		assert.doesNotMatch(html, new RegExp(`id="${legacyId}"`));
	}
});

test('root contracts forbid document-level vertical scrolling', () => {
	const css = read('styles/viewport-shell.css');
	assert.match(css, /height:\s*100dvh/);
	assert.match(css, /html,[\s\S]*body,[\s\S]*#sevenMitzvosApp[\s\S]*overflow:\s*hidden/);
	assert.match(css, /body\s*\{[\s\S]*position:\s*fixed/);
	assert.match(css, /\.appLayer\s*\{[\s\S]*overflow:\s*hidden/);
});

test('responsive grid keeps all seven titles inside one viewport', () => {
	const desktop = read('styles/mitzvah-grid-3d.css');
	const mobile = read('styles/mobile-controls.css');
	assert.match(desktop, /repeat\(4,\s*minmax\(0,\s*1fr\)\)/);
	assert.match(desktop, /repeat\(2,\s*minmax\(0,\s*1fr\)\)/);
	assert.match(mobile, /repeat\(2,\s*minmax\(0,\s*1fr\)\)/);
	assert.match(mobile, /repeat\(4,\s*minmax\(0,\s*1fr\)\)/);
});

test('registry exposes seven mechanically separate game controllers', () => {
	const registry = read('js/games3d/game-registry.js');
	for (const gameId of GAME_IDS) {
		assert.match(registry, new RegExp(`'${gameId}'\\s*:`));
	}
	assert.equal((registry.match(/:\s*[A-Z][A-Za-z]+Game/g) || []).length, 7);
});

test('legacy world hashes and new routes share the no-scroll router', () => {
	const router = read('js/app/hash-router.js');
	assert.match(router, /\['world-',\s*'game'\]/);
	assert.match(router, /\['play-',\s*'game'\]/);
	assert.match(router, /\['mitzvah-',\s*'detail'\]/);
});

test('renderer and procedural core are real local WebGL dependencies', () => {
	const stage = read('js/webgl/webgl-stage.js');
	const factory = read('js/webgl/procedural-mesh-factory.js');
	assert.match(stage, /new THREE\.WebGLRenderer/);
	assert.match(stage, /new THREE\.Raycaster/);
	assert.match(stage, /forceContextLoss/);
	assert.match(factory, /\/libs\/awtsmoos-procedural-core\/src\/adapters\/three\/index\.js/);
	assert.match(factory, /createProceduralThreeMesh/);
});

test('every new source begins with the blessing and stays within 120 lines', () => {
	const javascript = ['js/main.js', ...sourceFiles('js/app'), ...sourceFiles('js/views'), ...sourceFiles('js/webgl'), ...sourceFiles('js/games3d')];
	const browserTests = ['tests/cdp-client.mjs', 'tests/browser-runtime-smoke.mjs', 'tests/webgl-viewport-contract.test.mjs'];
	const importedStyles = [...read('styles/index.css').matchAll(/url\('\.\/(.+?\.css)'\)/g)].map(match => `styles/${match[1]}`);
	for (const source of [...javascript, ...browserTests, ...importedStyles]) {
		const content = read(source);
		assert.match(content, source.endsWith('.css') ? /^\/\*B"H\*\// : /^\/\/B"H/);
		assert.ok(content.split('\n').length <= 120, `${source} exceeds 120 lines`);
	}
});

function sourceFiles(relativeDirectory) {
	return readdirSync(join(projectRoot, relativeDirectory))
		.filter(name => name.endsWith('.js'))
		.map(name => `${relativeDirectory}/${name}`);
}
