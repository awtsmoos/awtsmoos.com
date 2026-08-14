// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file peopleDiscovery.test.mjs
 * @description The Awtsmoos proves public identity discovery is a real chamber with richer search, stale safety, and profile traversal.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { SocialHubApi } from '../js/api/SocialHubApi.js';
import { publicPersonLabel } from '../js/people/PeopleCard.js';

function source(relativePath) {
	return readFileSync(new URL(relativePath, import.meta.url), 'utf8');
}

const route = source('../js/navigation/RouteModel.js');
const panel = source('../js/people/PeoplePanel.js');
const view = source('../js/people/PeopleView.js');
const controls = source('../js/people/PeopleControls.js');
const card = source('../js/people/PeopleCard.js');
const assembly = source('../js/AppAssembly.js');
const hub = source('../js/HubApp.js');
const css = [
	source('../styles/people-discovery-core.css'),
	source('../styles/people-discovery-actions.css')
].join('\n');

test('people is a first-class dynamically mounted social chamber', () => {
	assert.match(route, /id: 'people'/);
	assert.match(view, /dataset\.panel = 'people'/);
	assert.match(view, /id = 'peoplePanel'/);
	assert.match(assembly, /new PeoplePanel/);
	assert.match(hub, /this\.people\.initialize\(\)/);
	assert.match(hub, /route\.id === 'people'/);
});

test('people API uses the bounded public identity endpoint', async () => {
	const requests = [];
	const api = new SocialHubApi(async url => {
		requests.push(String(url));
		return new Response(JSON.stringify({ BH: 'B"H', ok: true, success: { items: [] } }), {
			status: 200,
			headers: { 'content-type': 'application/json' }
		});
	});
	await api.people('teacher', { page: 2, limit: 12 });
	assert.equal(requests[0], '/api/social/people?q=teacher&page=2&limit=12');
});

test('people panel rejects stale responses and resets paging on search', () => {
	assert.match(panel, /this\.sequence/);
	assert.match(panel, /requestId !== this\.sequence/);
	assert.match(panel, /this\.page = 1/);
	assert.match(panel, /this\.api\.people/);
});

test('people controls expose richer bounded search and explicit paging callbacks', () => {
	assert.match(controls, /input\.maxLength = 80/);
	assert.match(controls, /Search public aliases by handle, name, or description/);
	assert.match(controls, /Search handle, name, or description/);
	assert.match(controls, /Public alias handle, name, or description/);
	assert.match(controls, /onSearch/);
	assert.match(controls, /onPage/);
});

test('people UI states richer public identity search and profile traversal honestly', () => {
	assert.equal(publicPersonLabel({ id: 'rebbe', name: 'Teacher' }), 'Teacher');
	assert.match(view, /handle, public name, or description/);
	assert.match(view, /Search scans .* public aliases/);
	assert.match(card, /onOpenAlias/);
	assert.match(panel, /this\.profile\.openAlias\(aliasId, true\)/);
	assert.doesNotMatch(`${view}\n${controls}\n${card}`, /innerHTML|insertAdjacentHTML/);
});

test('people presentation preserves touch reachability, mobile flow, and no blur', () => {
	assert.match(css, /min-height:\s*44px/);
	assert.match(css, /grid-template-columns:\s*1fr/);
	assert.doesNotMatch(css, /backdrop-filter|filter\s*:\s*blur/i);
});
