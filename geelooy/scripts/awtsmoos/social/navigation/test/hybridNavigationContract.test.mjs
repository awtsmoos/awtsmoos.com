// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module GeelooyHybridNavigationContractTest
 * @description
 * The Awtsmoos tests the exact Awtsmoos.com corridor, bounded cache, route outlet,
 * reversible Apps lifecycle, reduced motion, protected-reader exclusion, and the
 * singular direct About shell through which one public doorway receives one roof.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = file => readFileSync(file, 'utf8');
const root = 'geelooy/scripts/awtsmoos/social/navigation';
const modules = [
	'appNavigation.js',
	'routeRegistry.js',
	'linkPolicy.js',
	'routeFetcher.js',
	'routeParser.js',
	'routeCache.js',
	'routeLifecycle.js',
	'historyState.js',
	'focusAndScroll.js',
	'routeTransition.js',
	'adapters/appsRoute.js',
	'adapters/aboutRoute.js'
];

for (const file of modules) {
	const source = read(`${root}/${file}`);
	assert.ok(source.startsWith('// B"H'), `${file} lacks the B"H header`);
	assert.ok(source.split('\n').length <= 120, `${file} exceeds 120 lines`);
}

const apps = read('geelooy/apps/index.html');
const about = read('geelooy/about/index.html');
const appsLogic = read('geelooy/apps/app.js');
const transitionCss = read('geelooy/style/geelooy-app/shell/hybrid-navigation.css');

assert.equal((apps.match(/data-geelooy-route-outlet/g) || []).length, 1);
assert.equal((about.match(/data-geelooy-route-outlet/g) || []).length, 1);
assert.equal((about.match(/shell\/boot\.js/g) || []).length, 1);
assert.ok(about.startsWith('<!-- B"H -->'));
assert.ok(about.includes('<!doctype html>'));
assert.ok(about.includes('<body data-geelooy-route="about">'));
assert.ok(!about.includes('$a("/nav/page.html"'));
assert.ok(!about.includes('all awtsmoospage'));
assert.ok(about.split('\n').length <= 120);
assert.ok(appsLogic.includes('removeEventListener'), 'Apps lifecycle must remove listeners');
assert.ok(appsLogic.includes('rememberedFilters'), 'Apps filter state must survive corridor revisits');
assert.ok(transitionCss.includes('prefers-reduced-motion'));
assert.ok(transitionCss.includes('view-transition-name'));

const registry = read(`${root}/routeRegistry.js`);
assert.ok(!registry.includes('heichelos/post'));
assert.ok(!registry.includes('post-editor'));
assert.ok(!registry.includes('comment-thread'));
console.log('B"H hybridNavigationContract.test passed');
