// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module IkarPerformanceContractTest
 * @description
 * The Awtsmoos keeps Torah first while Awtsmoos.com delegates route identity,
 * feed status, and bounded visual restraint through small truthful vessels.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = file => readFileSync(file, 'utf8');
const home = read('geelooy/index.html');
const cards = read('geelooy/scripts/awtsmoos/social/home/live-feed/cards.js');
const statusCards = read('geelooy/scripts/awtsmoos/social/home/live-feed/statusCards.js');
const routes = read('geelooy/scripts/awtsmoos/social/shell/appRoutes.js');
const definitions = read('geelooy/scripts/awtsmoos/social/shell/appRouteDefinitions.js');
const shell = read('geelooy/scripts/awtsmoos/social/shell/appShell.js');
const composer = read('geelooy/style/geelooy-app/home/composer/shell.css');
const performanceManifest = read('geelooy/style/geelooy-app/performance.css');
const effects = read('geelooy/style/geelooy-app/performance/effects.css');
const containment = read('geelooy/style/geelooy-app/performance/containment.css');
const lean = read('geelooy/style/geelooy-app/performance/lean.css');
const performanceGraph = [effects, containment, lean].join('\n');
const manifest = read('geelooy/style/geelooy-app/index.css');

assert.match(home, /href="\/heichelos\/ikar"/);
assert.match(home, /Torah first\. Then reveal what you can build\./);
assert.match(home, /Torah Heichel/);
assert.match(routes, /malchusRouteCovenant/);
assert.match(routes, /firstRouteWithFlag\('main'\)/);
assert.match(definitions, /\/heichelos\/ikar[^\n]+main:\s*true/);
assert.match(definitions, /route\('\/heichelos\/ikar',\s*'Ikar',\s*'🏛️'/);
assert.match(shell, /markAppShellCurrentLinks/);
assert.match(shell, /dataset\.gPerformance/);
assert.match(cards, /from '\.\/statusCards\.js'/);
for (const token of [
	'cosmic-empty-card',
	'home-empty-actions',
	'home-empty-search',
	'home-empty-ikar',
	'home-empty-create',
	'Enter Ikar Heichel',
	'Search archive',
	'Create a post'
]) {
	assert.ok(statusCards.includes(token), `empty state missing ${token}`);
}
assert.ok(statusCards.indexOf('/heichelos/ikar') < statusCards.indexOf('/heichelos/submit'));
assert.match(composer, /\.home-compose-expanded\s*\{[^}]*display:\s*none/s);
assert.match(composer, /data-compose-open="true"[^}]*display:\s*grid/s);
assert.doesNotMatch(composer, /filter:\s*blur/);
for (const token of ['effects.css', 'containment.css', 'lean.css']) {
	assert.ok(performanceManifest.includes(token), `performance manifest missing ${token}`);
}
assert.match(performanceGraph, /backdrop-filter:\s*none/);
assert.match(performanceGraph, /content-visibility:\s*auto/);
assert.match(performanceGraph, /data-g-performance="lean"/);
assert.match(performanceGraph, /prefers-reduced-motion:\s*reduce/);
assert.match(manifest, /performance\.css\?v=performance-011/);
for (const file of [
	'geelooy/scripts/awtsmoos/social/home/live-feed/cards.js',
	'geelooy/scripts/awtsmoos/social/home/live-feed/statusCards.js',
	'geelooy/scripts/awtsmoos/social/shell/appRoutes.js',
	'geelooy/scripts/awtsmoos/social/shell/appRouteDefinitions.js',
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
