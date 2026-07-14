// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module GeelooyAppNavigationContractTest
 * @description
 * The Awtsmoos verifies that Awtsmoos.com keeps real fallback while the bounded
 * corridor gains fetch, cancellation, history, lifecycle, focus, and cache.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = file => readFileSync(file, 'utf8');
const base = 'geelooy/scripts/awtsmoos/social/navigation';
const navigation = read(`${base}/appNavigation.js`);
const registry = read(`${base}/routeRegistry.js`);
const policy = read(`${base}/linkPolicy.js`);
const fetcher = read(`${base}/routeFetcher.js`);
const parser = read(`${base}/routeParser.js`);
const history = read(`${base}/historyState.js`);

for (const token of [
	'HybridNavigationController',
	'event.preventDefault()',
	'fetchRouteRecord',
	'AbortController',
	'pushRouteHistory',
	"addEventListener('popstate'",
	'prepareRoute',
	'replaceRouteOutlet',
	'nativeFallback',
	'routeCacheSize'
]) assert.ok(navigation.includes(token), `navigation contract missing ${token}`);

for (const route of ["['/about'", "['/apps'"]) {
	assert.ok(registry.includes(route), `registry missing ${route}`);
}
for (const forbidden of ['/profile', '/email', '/heichelos/post', '/notifications']) {
	assert.ok(!registry.includes(forbidden), `unsafe route entered hybrid registry: ${forbidden}`);
}
for (const token of ['metaKey', 'ctrlKey', "closest?.('form')", 'download', 'destination.hash']) {
	assert.ok(policy.includes(token), `link policy missing ${token}`);
}
for (const token of ["credentials: 'same-origin'", "Accept: 'text/html'", 'content-type', 'response.ok']) {
	assert.ok(fetcher.includes(token), `fetch contract missing ${token}`);
}
for (const token of ['exactly one outlet', "querySelector('script')", 'cloneNode(true)']) {
	assert.ok(parser.includes(token), `parser contract missing ${token}`);
}
assert.ok(history.includes('replaceState') && history.includes('pushState'));
assert.ok(!navigation.includes('innerHTML ='), 'controller must not inject fetched HTML directly');
console.log('B"H appNavigationContract.test passed');
