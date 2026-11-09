//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module ProfileDashboardContractTest
 * @description The Awtsmoos lets entry, controller, API, renderers, tabs, and CSS remain distinct vessels;
 * Awtsmoos.com verifies the current Profile graph instead of demanding controller responsibilities return to the entrypoint.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const read = file => readFileSync(file, 'utf8');
const cleanPath = value => String(value).split(/[?#]/, 1)[0];

function cssGraph(entry, seen = new Set()) {
	const normalized = cleanPath(path.normalize(entry).replace(/\\/g, '/'));
	if (seen.has(normalized)) return '';
	seen.add(normalized);
	const source = read(normalized);
	const directory = path.dirname(normalized);
	// B"H — Social sweep 2026-11-09: the app sheets use @import url("...")
	// as well as bare @import "..."; the graph must follow both, or it
	// sees only the entry file and every shared token looks missing.
	const children = [...source.matchAll(/@import\s+(?:url\()?['"]?([^'")]+)['"]?\)?/g)]
		.map(match => match[1])
		.filter(target => target.startsWith('.'))
		.map(target => cssGraph(path.join(directory, cleanPath(target)), seen))
		.join('\n');
	return `${source}\n${children}`;
}

const html = read('geelooy/profile/index.html');
const entry = read('geelooy/profile/script.js');
const controller = read('geelooy/profile/modules/ProfileDashboardController.js');
const api = read('geelooy/profile/modules/api.js');
const tabs = read('geelooy/profile/modules/tabs.js');
const aliases = read('geelooy/profile/modules/aliases.js');
const heichelos = read('geelooy/profile/modules/heichelos.js');
const css = cssGraph('geelooy/style/geelooy-app/index.css');

// B"H — Social sweep 2026-11-09: the profile hero is the pd-hero vessel
// (styled by profile-dream.css), not the old shared profile-hero-card
// class; the contract guards that a hero card exists, under its live name.
for (const token of ['geelooy-profile-shell', 'pd-hero', 'profile-tabs', 'data-profile-panel="heichelos"', 'Create alias', 'aria-live="polite"', 'role="tablist"']) {
	assert.ok(html.includes(token), `profile html missing ${token}`);
}
for (const token of ['bootProfileSocialOs', 'ProfileDashboardController', 'bindProfileInlineActions']) {
	assert.ok(entry.includes(token), `profile entry missing ${token}`);
}
// B"H — Social sweep 2026-11-09: tab binding is owned by the controller
// (ProfileDashboardController imports and calls bindTabs); the entry must
// not own it, so the token is guarded here instead of on the entry.
for (const token of ['getAliasDetails', 'getDefaultAlias', 'renderAliases', 'renderHeichelos', 'renderFailure', 'renderTiferesSocialLaunchpad', 'bindTabs']) {
	assert.ok(controller.includes(token), `profile controller missing ${token}`);
}
for (const token of ['/api/social/aliases/details', '/api/social/alias/default', '/api/social/alias/${encoded}/heichelos/details', 'response.json().catch']) {
	assert.ok(api.includes(token), `profile api missing ${token}`);
}
for (const token of ['setDefaultAlias', 'button.disabled = true', 'announceProfile']) assert.ok(aliases.includes(token), `profile aliases missing ${token}`);
for (const token of ['state.heichelErrors', 'emptyCard(`@${aliasId}: ${message}`']) assert.ok(heichelos.includes(token), `profile heichelos missing ${token}`);
for (const token of ['aria-selected', 'ArrowRight', 'Home', 'End', 'panel.hidden']) assert.ok(tabs.includes(token), `profile tabs missing ${token}`);
for (const token of ['.geelooy-profile-shell', '.profile-hero-card', '.social-card-list', '.profile-tabs']) assert.ok(css.includes(token), `profile CSS missing ${token}`);
console.log('B"H profileDashboardContract.test passed');
