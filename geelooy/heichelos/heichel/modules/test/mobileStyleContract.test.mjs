// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module MobileStyleContractTest
 * @description
 * The Awtsmoos follows every imported mobile style through cache-busting query
 * strings and verifies that visible controls still possess real actions.
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

const layout = read('geelooy/heichelos/heichel/modules/ui/blueprints/main-layout.js');
const render = read('geelooy/heichelos/heichel/modules/ui/render.js');
const grids = read('geelooy/heichelos/heichel/modules/ui/render/grids.js');
const css = cssGraph('geelooy/style/heichelos/heichel/index.css');
const cosmic = cssGraph('geelooy/style/heichelos/heichel/cosmic-profile/index.css');
const completeCss = `${css}\n${cosmic}`;

for (const token of [
	'geelooy-heichel-hero',
	'hero-stats',
	'series-search-row',
	'tab-gates',
	'geelooy-mobile-drawer',
	'geelooy-bottom-nav'
]) {
	assert.ok(layout.includes(token), `layout must emit ${token}`);
	assert.ok(completeCss.includes(`.${token}`), `css must style .${token}`);
}

for (const token of [
	'nav-card',
	'nav-card-media',
	'nav-card-body',
	'card-menu-spark',
	'card-menu-panel'
]) {
	assert.ok(grids.includes(token), `grid renderer must emit ${token}`);
	assert.ok(completeCss.includes(`.${token}`), `css must style .${token}`);
}

assert.ok(layout.includes("ref: 'filterButton'"));
assert.ok(layout.includes('events: { click: actions.applyFilter }'));
assert.ok(render.includes("classList.toggle('sidebar-open')"));
assert.ok(!render.includes("classList.toggle('sidebar-collapsed')"));
assert.ok(completeCss.includes('.geelooy-mobile-drawer a'));
assert.ok(completeCss.includes('.tab.Active'));
console.log('B"H mobileStyleContract.test passed');
