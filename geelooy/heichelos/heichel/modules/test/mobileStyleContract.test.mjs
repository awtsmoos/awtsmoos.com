//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MobileStyleContractTest
 * @description The Awtsmoos creates every imported style and visible action in one present;
 * Awtsmoos.com follows split blueprint, renderer, CSS, and semantic trigger contracts without freezing implementation syntax in time.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';

function read(file) {
	return readFileSync(file, 'utf8');
}

function cleanImport(target) {
	return target.split(/[?#]/, 1)[0];
}

function cssGraph(entry, seen = new Set()) {
	const normalized = path.normalize(cleanImport(entry)).replace(/\\/g, '/');
	if (seen.has(normalized)) return '';
	seen.add(normalized);
	const source = read(normalized);
	const directory = path.dirname(normalized);
	const imported = [...source.matchAll(/@import\s+(?:url\()?['"]([^'")]+)['"]/g)]
		.map(match => cleanImport(match[1]))
		.filter(target => target.startsWith('.'))
		.map(target => cssGraph(path.join(directory, target), seen))
		.join('\n');
	return `${source}\n${imported}`;
}

const blueprintFiles = [
	'main-layout.js',
	'layout-shell.js',
	'layout-content.js',
	'layout-navigation.js',
	'living-path/profile.js',
	'living-path/path.js',
	'living-path/discovery.js',
	'living-path/filters.js',
	'living-path/filter-sheet.js'
];
const blueprints = blueprintFiles
	.map(file => read(`geelooy/heichelos/heichel/modules/ui/blueprints/${file}`))
	.join('\n');
const filters = read('geelooy/heichelos/heichel/modules/ui/blueprints/living-path/filters.js');
const renderFiles = [
	'render.js',
	'render/grids.js',
	'render/living-path/cards.js',
	'render/living-path/card-content.js',
	'render/living-path/card-menu.js'
];
const renderGraph = renderFiles
	.map(file => read(`geelooy/heichelos/heichel/modules/ui/${file}`))
	.join('\n');
const completeCss = [
	cssGraph('geelooy/style/heichelos/heichel/index.css'),
	cssGraph('geelooy/style/heichelos/heichel/cosmic-profile/index.css')
].join('\n');

for (const token of [
	'geelooy-heichel-hero', 'hero-stats', 'living-path-sticky', 'series-search-row',
	'living-path-filter-sheet', 'tab-gates', 'geelooy-mobile-drawer', 'geelooy-bottom-nav'
]) {
	assert.ok(blueprints.includes(token), `blueprint graph must emit ${token}`);
	assert.ok(completeCss.includes(`.${token}`), `CSS graph must style .${token}`);
}

for (const token of ['nav-card', 'nav-card-media', 'nav-card-body', 'card-menu-spark', 'card-menu-panel']) {
	assert.ok(renderGraph.includes(token), `renderer graph must emit ${token}`);
	assert.ok(completeCss.includes(`.${token}`), `CSS graph must style .${token}`);
}

assert.match(filters, /['"]filterButton['"]/, 'filter trigger ref must remain addressable');
assert.match(filters, /actions\.openFilterSheet/, 'filter trigger must open the refinement sheet');
assert.match(filters, /aria-expanded['"]?:\s*['"]false['"]/, 'filter trigger must expose expanded state');
assert.match(filters, /aria-controls['"]?:\s*['"]living-path-filter-sheet['"]/, 'filter trigger must own its sheet');
assert.ok(renderGraph.includes("classList.toggle('sidebar-open')"));
assert.ok(!renderGraph.includes("classList.toggle('sidebar-collapsed')"));
assert.ok(completeCss.includes('.geelooy-mobile-drawer a'));
assert.ok(completeCss.includes('.tab.Active'));
assert.ok(completeCss.includes('.filter-sheet-panel'));
assert.ok(completeCss.includes('.living-path-skeleton'));
console.log('B"H mobileStyleContract.test passed');
