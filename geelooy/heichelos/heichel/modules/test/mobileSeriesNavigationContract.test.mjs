//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MobileSeriesNavigationContractTest
 * @description The Awtsmoos lets narrow geometry manifest before commanded overlays rise above it;
 * Awtsmoos.com guards the real split Living Path blueprint and final cascade without freezing an obsolete last-import assumption.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = path => readFileSync(path, 'utf8');
const blueprintFiles = [
	'layout-roof.js', 'layout-shell.js', 'layout-content.js', 'layout-navigation.js',
	'layout-primitives.js', 'living-path/profile.js', 'living-path/path.js',
	'living-path/discovery.js', 'living-path/filters.js', 'living-path/filter-sheet.js'
];
const blueprints = blueprintFiles
	.map(name => read(`geelooy/heichelos/heichel/modules/ui/blueprints/${name}`))
	.join('\n');
const grids = read('geelooy/heichelos/heichel/modules/ui/render/grids.js');
const cardData = read('geelooy/heichelos/heichel/modules/ui/render/cardData.js');
const html = read('geelooy/heichelos/_awtsmoos.heichel.html');
const cosmicIndex = read('geelooy/style/heichelos/heichel/cosmic-profile/index.css');
const mobileIndex = read('geelooy/style/heichelos/heichel/cosmic-profile/mobile-series/index.css');
const livingIndex = read('geelooy/style/heichelos/heichel/cosmic-profile/mobile-series/living-path/index.css');
const shell = read('geelooy/style/heichelos/heichel/cosmic-profile/mobile-series/shell-layout.css');
const profile = read('geelooy/style/heichelos/heichel/cosmic-profile/mobile-series/living-path/profile.css');
const tabs = read('geelooy/style/heichelos/heichel/cosmic-profile/mobile-series/shell-tabs.css');
const breadcrumbs = read('geelooy/style/heichelos/heichel/cosmic-profile/mobile-series/context-breadcrumbs.css');
const search = read('geelooy/style/heichelos/heichel/cosmic-profile/mobile-series/living-path/search.css');
const states = read('geelooy/style/heichelos/heichel/cosmic-profile/mobile-series/living-path/states.css');

for (const token of [
	'heichel-mobile-topbar', 'geelooy-heichel-hero', 'hero-stats', 'living-path-sticky',
	'heichel-profile-details', 'series-heading', 'series-search-row', 'living-path-filter-sheet', 'geelooy-bottom-nav'
]) assert.ok(blueprints.includes(token), `blueprint graph missing ${token}`);
for (const token of ['renderTimeline', 'renderTree', 'renderGroupings']) {
	assert.ok(grids.includes(token), `grid coordinator missing ${token}`);
}
for (const token of ['normalizeCardData', 'postCount', 'subSeriesCount', 'commentsCount', 'matchesQuery', 'direction']) {
	assert.ok(cardData.includes(token), `card data missing ${token}`);
}

assert.ok(html.includes('/style/heichelos/heichel/index.css'), 'Heichel HTML must load split CSS');
const mobileImport = '@import "./mobile-series/index.css";';
const overlayImport = '@import "./overlay-layer.css?v=heichel-ui-006";';
assert.ok(cosmicIndex.includes(mobileImport), 'cosmic profile must include mobile series geometry');
assert.ok(cosmicIndex.includes(overlayImport), 'cosmic profile must include final overlay layer');
assert.ok(cosmicIndex.indexOf(mobileImport) < cosmicIndex.indexOf(overlayImport), 'mobile geometry must precede overlays');
assert.match(cosmicIndex, /@import "\.\/overlay-layer\.css\?v=heichel-ui-006";\s*$/, 'overlay layer must own final cascade');
assert.match(mobileIndex, /@import "\.\/living-path\/index\.css";\s*$/);
for (const moduleName of ['profile.css', 'sticky-path.css', 'filter-sheet.css', 'timeline.css', 'tree.css', 'groupings.css', 'guardrails.css']) {
	assert.ok(livingIndex.includes(moduleName), `Living Path manifest missing ${moduleName}`);
}
assert.match(shell, /\.geelooy-main-stage\s*\{[^}]*inline-size:\s*100%\s*!important/s);
assert.match(shell, /overflow-x:\s*clip/);
assert.match(profile, /\.heichel-profile-cover\s*\{[^}]*block-size:\s*3\.75rem/s);
assert.match(tabs, /repeat\(4, minmax\(0, 1fr\)\)/);
assert.match(breadcrumbs, /\.breadcrumb-river\s*\{[^}]*flex-wrap:\s*nowrap/s);
assert.match(search, /living-path-result-status/);
assert.match(states, /living-path-skeleton/);
console.log('B"H mobileSeriesNavigationContract.test passed');
