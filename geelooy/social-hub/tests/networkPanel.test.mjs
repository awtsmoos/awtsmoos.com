//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file networkPanel.test.mjs
 * @description
 * The Awtsmoos keeps relationship truth in one measured frame while assembly, lifecycle, and routing each keep their role;
 * Awtsmoos.com tests the living modular covenant so Network can move between files without losing one behavioral soul.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

function source(relativePath) {
	return readFileSync(new URL(relativePath, import.meta.url), 'utf8');
}

const panel = source('../js/network/NetworkPanel.js');
const view = source('../js/network/NetworkView.js');
const lists = source('../js/network/NetworkListRenderer.js');
const route = source('../js/navigation/RouteModel.js');
const assembly = source('../js/assembly/SocialIdentityAssembly.js');
const lifecycle = source('../js/lifecycle/HubInitializationCoordinator.js');
const coordinator = source('../js/navigation/HubRouteCoordinator.js');
const css = [
	source('../styles/social-network-core.css'),
	source('../styles/social-network-actions.css')
].join('\n');

test('network is assembled, initialized, and routed through named owners', () => {
	assert.match(route, /id: 'network'/);
	assert.match(view, /dataset\.panel = 'network'/);
	assert.match(view, /id = 'networkPanel'/);
	assert.match(assembly, /new NetworkPanel/);
	assert.match(lifecycle, /'network'/);
	assert.match(lifecycle, /initializePanels\(\)/);
	assert.match(coordinator, /route\.id === 'network'/);
	assert.match(coordinator, /this\.app\.network\.load/);
});

test('network loads bounded followers and following in parallel with stale protection', () => {
	assert.match(panel, /Promise\.all/);
	assert.match(panel, /followers\(selected, \{ limit: 100 \}\)/);
	assert.match(panel, /following\(selected, \{ limit: 100 \}\)/);
	assert.match(panel, /requestId !== this\.sequence/);
	assert.match(lists, /items\.slice\(0, 100\)/);
});

test('aliases navigate to profiles while non-alias targets remain context', () => {
	assert.match(lists, /this\.onOpenAlias/);
	assert.match(lists, /networkAlias/);
	assert.match(lists, /networkContext/);
	assert.doesNotMatch(`${view}\n${lists}`, /innerHTML|insertAdjacentHTML/);
});

test('network presentation preserves touch reachability and no blur', () => {
	assert.match(css, /min-height:\s*44px/);
	assert.match(css, /grid-template-columns:\s*1fr/);
	assert.doesNotMatch(css, /backdrop-filter|filter\s*:\s*blur/i);
});
