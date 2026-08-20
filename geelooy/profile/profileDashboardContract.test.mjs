// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module ProfileDashboardContractTest
 * @description
 * The Awtsmoos traces the Profile through its shared Awtsmoos.com CSS graph
 * while cache-version query strings remain transport details, never filenames.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const read = file => readFileSync(file, 'utf8');

function cssGraph(entry, seen = new Set()) {
	const normalized = cleanPath(path.normalize(entry).replace(/\\/g, '/'));
	if (seen.has(normalized)) return '';
	seen.add(normalized);
	const source = read(normalized);
	const directory = path.dirname(normalized);
	const children = [...source.matchAll(/@import\s+['"]([^'"]+)['"]/g)]
		.map(match => match[1])
		.filter(target => target.startsWith('.'))
		.map(target => cssGraph(path.join(directory, cleanPath(target)), seen))
		.join('\n');
	return `${source}\n${children}`;
}

function cleanPath(value) {
	return String(value).split(/[?#]/, 1)[0];
}

const html = read('geelooy/profile/index.html');
const entry = read('geelooy/profile/script.js');
const api = read('geelooy/profile/modules/api.js');
const tabs = read('geelooy/profile/modules/tabs.js');
const aliases = read('geelooy/profile/modules/aliases.js');
const heichelos = read('geelooy/profile/modules/heichelos.js');
const css = cssGraph('geelooy/style/geelooy-app/index.css');

for (const token of ['geelooy-profile-shell', 'profile-hero-card', 'profile-tabs', 'data-profile-panel="heichelos"', 'Create alias', 'aria-live="polite"', 'role="tablist"', '/style/geelooy-app/index.css']) {
	assert.ok(html.includes(token), `profile html missing ${token}`);
}
for (const token of ['bindTabs', 'loadProfile', 'renderHeichelos', 'renderFatalProfileError']) {
	assert.ok(entry.includes(token), `profile entry missing ${token}`);
}
for (const token of ['/api/social/aliases/details', '/api/social/alias/default', '/api/social/alias/${encoded}/heichelos/details', 'response.json().catch']) {
	assert.ok(api.includes(token), `profile api missing ${token}`);
}
for (const token of ['setDefaultAlias', 'button.disabled = true', 'announceProfile']) {
	assert.ok(aliases.includes(token), `profile aliases missing ${token}`);
}
for (const token of ['state.heichelErrors', 'emptyCard(`@${aliasId}: ${message}`']) {
	assert.ok(heichelos.includes(token), `profile heichelos missing ${token}`);
}
for (const token of ['aria-selected', 'ArrowRight', 'panel.hidden']) {
	assert.ok(tabs.includes(token), `profile tabs missing ${token}`);
}
for (const token of ['.geelooy-profile-shell', '.profile-hero-card', '.social-card-list', '.profile-tabs']) {
	assert.ok(css.includes(token), `profile CSS missing ${token}`);
}

assert.ok(cleanPath('./tokens.css?v=interface-dark-011').endsWith('tokens.css'));
assert.ok(import.meta.url);
console.log('B"H profileDashboardContract.test passed');
