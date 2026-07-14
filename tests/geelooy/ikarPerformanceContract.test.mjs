// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module IkarPerformanceContractTest
 * @description
 * Guards the Ikar-first hierarchy, separated empty-state language, compact
 * composer, emoji navigation, and focused low-work visual graph.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = file => readFileSync(file, 'utf8');
const home = read('geelooy/index.html');
const cards = read('geelooy/scripts/awtsmoos/social/home/live-feed/cards.js');
const routes = read('geelooy/scripts/awtsmoos/social/shell/appRoutes.js');
const shell = read('geelooy/scripts/awtsmoos/social/shell/appShell.js');
const composer = read('geelooy/style/geelooy-app/home/composer/shell.css');
const performanceManifest = read('geelooy/style/geelooy-app/performance.css');
const effects = read('geelooy/style/geelooy-app/performance/effects.css');
const containment = read('geelooy/style/geelooy-app/performance/containment.css');
const lean = read('geelooy/style/geelooy-app/performance/lean.css');
const performanceGraph = [effects, containment, lean].join('\n');
const manifest = read('geelooy/style/geelooy-app/index.css');

assert.ok(home.indexOf('/heichelos/ikar') < home.indexOf('/heichelos/submit'));
assert.match(home, /🏛️ Ikar|Enter Ikar Heichel/);
assert.match(routes, /main:\s*true/);
assert.match(routes, /icon:\s*'🏛️'/);
assert.match(shell, /dataset\.mainRoute/);
for (const token of [
	'home-empty-heading',
	'home-empty-badge',
	'home-empty-title',
	'home-empty-message',
	'home-empty-actions',
	'home-empty-ikar'
]) {
	assert.ok(cards.includes(token), `empty state missing ${token}`);
}
assert.ok(cards.indexOf('/heichelos/ikar') < cards.indexOf('/heichelos/submit'));
assert.match(composer, /\.home-compose-expanded\s*\{[^}]*display:\s*none/s);
assert.match(composer, /data-compose-open="true"[^}]*display:\s*grid/s);
assert.doesNotMatch(composer, /filter:\s*blur/);
for (const token of ['effects.css', 'containment.css', 'lean.css']) {
	assert.ok(performanceManifest.includes(token), `performance manifest missing ${token}`);
}
assert.match(performanceGraph, /backdrop-filter:\s*none\s*!important/);
assert.match(performanceGraph, /content-visibility:\s*auto/);
assert.match(performanceGraph, /data-g-performance="lean"/);
assert.match(manifest, /performance\.css\?v=speed-001/);
for (const file of [
	'geelooy/scripts/awtsmoos/social/home/live-feed/cards.js',
	'geelooy/scripts/awtsmoos/social/shell/appRoutes.js',
	'geelooy/scripts/awtsmoos/social/shell/appShell.js',
	'geelooy/scripts/awtsmoos/social/shell/performanceProfile.js',
	'geelooy/style/geelooy-app/performance.css',
	'geelooy/style/geelooy-app/performance/effects.css',
	'geelooy/style/geelooy-app/performance/containment.css',
	'geelooy/style/geelooy-app/performance/lean.css',
	'geelooy/style/geelooy-app/home/composer/shell.css'
]) {
	assert.ok(read(file).split('\n').length - 1 <= 120, `${file} exceeds 120 lines`);
}
console.log('B"H Ikar performance contract passed.');
