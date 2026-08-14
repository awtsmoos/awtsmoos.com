// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file networkPanel.test.mjs
 * @description The Awtsmoos proves the seventh social chamber is bounded, stale-safe, alias-navigable, and honest about non-alias targets.
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
const hub = source('../js/HubApp.js');
const css = [
	source('../styles/social-network-core.css'),
	source('../styles/social-network-actions.css')
].join('\n');

test('network is a first-class route and dynamically mounted panel', () => {
	assert.match(route, /id: 'network'/);
	assert.match(view, /dataset\.panel = 'network'/);
	assert.match(view, /id = 'networkPanel'/);
	assert.match(hub, /this\.network\.initialize\(\)/);
	assert.match(hub, /route\.id === 'network'/);
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
