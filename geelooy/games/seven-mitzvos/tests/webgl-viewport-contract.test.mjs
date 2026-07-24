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
 * @description Hub, teachings, account, and persistent realm remain one fixed,
 * procedural-core Awtsmoos.com application whose nested source stays modular.
 */
const project = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = path => readFileSync(join(project, path), 'utf8');
const GAME_IDS = [
	'false-powers', 'words-of-creation', 'every-life', 'households',
	'honest-market', 'living-sanctuary', 'court-of-nations'
];

test('entry contains one fixed app, persistent realm, and account drawer', () => {
	const html = read('index.html');
	const template = read('js/realm/realm-template.js');
	assert.match(html, /id="sevenMitzvosApp"/);
	assert.match(read('js/app/app-template.js'), /id="realmLayer"/);
	assert.match(template, /id="realmAccountDrawer"/);
	assert.match(template, /id="realmAccountToggle"/);
	for (const id of ['livingWorldMount', 'campaignMount', 'universeMount', 'quizMount']) {
		assert.doesNotMatch(html, new RegExp(`id="${id}"`));
	}
});

test('router exposes hub, detail, game, and realm', () => {
	const source = read('js/app/hash-router.js');
	for (const pattern of [/hash === 'realm'/, /view === 'realm'/, /\['world-',\s*'game'\]/, /\['play-',\s*'game'\]/, /\['mitzvah-',\s*'detail'\]/]) {
		assert.match(source, pattern);
	}
});

test('application owns one disposable realm session', () => {
	const source = read('js/app/seven-mitzvos-app.js');
	for (const pattern of [/new RealmSession/, /this\.realm\.start/, /this\.realm\.stop/, /\['hub', 'detail', 'game', 'realm'\]/]) {
		assert.match(source, pattern);
	}
});

test('root, realm, and account drawer confine scrolling', () => {
	const shell = read('styles/viewport-shell.css');
	const realm = read('styles/realm-shell.css');
	const account = read('styles/realm-account.css');
	assert.match(shell, /height:\s*100dvh/);
	assert.match(shell, /html,[\s\S]*body,[\s\S]*#sevenMitzvosApp[\s\S]*overflow:\s*hidden/);
	assert.match(realm, /\.realmLayer\s*\{[\s\S]*overflow:\s*hidden/);
	assert.match(account, /\.realmAccountScroll[\s\S]*overflow:\s*auto/);
});

test('responsive grid keeps all seven teaching titles visible', () => {
	const desktop = read('styles/mitzvah-grid-3d.css');
	const mobile = read('styles/mobile-controls.css');
	assert.match(desktop, /repeat\(4,\s*minmax\(0,\s*1fr\)\)/);
	assert.match(desktop, /repeat\(2,\s*minmax\(0,\s*1fr\)\)/);
	assert.match(mobile, /repeat\(2,\s*minmax\(0,\s*1fr\)\)/);
	assert.match(mobile, /repeat\(4,\s*minmax\(0,\s*1fr\)\)/);
});

test('registry retains seven separate teaching controllers', () => {
	const source = read('js/games3d/game-registry.js');
	for (const id of GAME_IDS) assert.match(source, new RegExp(`'${id}'\\s*:`));
	assert.equal((source.match(/:\s*[A-Z][A-Za-z]+Game/g) || []).length, 7);
});

test('renderer, raycaster, and procedural core remain real', () => {
	const stage = read('js/webgl/webgl-stage.js');
	const picker = read('js/webgl/semantic-picker.js');
	const core = read('js/procedural/core-part-factory.js');
	assert.match(stage, /new THREE\.WebGLRenderer/);
	assert.match(stage, /forceContextLoss/);
	assert.match(picker, /new THREE\.Raycaster/);
	assert.match(picker, /intersectObjects\(this\.targets, true\)/);
	assert.match(core, /libs\/awtsmoos-procedural-core\/src\/adapters\/three\/index\.js/);
	assert.match(core, /createProceduralThreeMesh/);
});

test('nested account and browser source begins blessed and stays within 120 lines', () => {
	const javascript = [
		'js/main.js',
		...['app', 'views', 'webgl', 'games3d', 'materials', 'assets', 'realm', 'realm/account']
			.flatMap(directory => sourceFiles(`js/${directory}`))
	];
	const browserTests = [
		'cdp-client', 'browser-account-smoke', 'browser-frame-sampler',
		'browser-material-inspection', 'browser-model-inspection',
		'browser-realm-smoke', 'browser-runtime-smoke'
	].map(name => `tests/${name}.mjs`);
	const styles = [...read('styles/index.css').matchAll(/url\('\.\/(.+?\.css)'\)/g)]
		.map(match => `styles/${match[1]}`);
	for (const source of [...javascript, ...browserTests, ...styles]) {
		const content = read(source);
		assert.match(content, source.endsWith('.css') ? /^\/\*B"H\*\// : /^\/\/B"H/);
		assert.ok(content.split(String.fromCharCode(10)).length <= 120, `${source} exceeds 120 lines`);
	}
});

function sourceFiles(directory) {
	return readdirSync(join(project, directory))
		.filter(name => name.endsWith('.js'))
		.map(name => `${directory}/${name}`);
}
