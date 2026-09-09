// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file IkarAuthorityContract
 * @description
 * The Awtsmoos turns final Ikar visual ownership into permanent release laws.
 * Awtsmoos.com proves late load order, bounded modules, isolated scope, one owner
 * per concern, compact context, focused workspaces, cards, and search geometry.
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = path => readFileSync(path, 'utf8');
const template = read('geelooy/heichelos/heichel/_awtsmoos.heichel.html');
const base = 'geelooy/style/heichelos/heichel/premium/authority';
const names = [
	'shell.css',
	'browser.css',
	'search.css',
	'cards.css',
	'context.css',
	'focus.css',
	'workspaces.css',
	'mobile.css'
];
const manifest = read(`${base}.css`);
const sources = Object.fromEntries(names.map(name => [name, read(`${base}/${name}`)]));

test('Ikar authority loads after shared cosmic chrome', () => {
	const cosmic = template.indexOf('/cosmic-profile/index.css');
	const authority = template.indexOf('/premium/authority.css');
	assert.ok(cosmic >= 0);
	assert.ok(authority > cosmic);
	assert.match(template, /ikar-authority-005/);
});

test('Ikar authority remains modular and bounded', () => {
	for (const name of names) {
		assert.ok(manifest.includes(name), `${name} authority import missing`);
		assert.ok(sources[name].split('\n').length - 1 <= 120, `${name} exceeds 120 lines`);
	}
	assert.ok(manifest.split('\n').length - 1 <= 120);
});

test('authority scope cannot leak into neighboring Heichelos', () => {
	for (const source of Object.values(sources)) {
		assert.match(source, /data-heichel-id="ikar"/);
	}
	assert.doesNotMatch(sources['focus.css'], /^\s*\.geelooy-main-stage/m);
});

test('Ikar shell owns a compact non-stretching study stage', () => {
	const shell = sources['shell.css'];
	assert.match(shell, /max-inline-size:\s*84rem\s*!important/);
	assert.match(shell, /align-content:\s*start\s*!important/);
	assert.match(shell, /min-block-size:\s*0\s*!important/);
});

test('search has one responsive owner instead of fighting mobile authority', () => {
	const search = sources['search.css'];
	const mobile = sources['mobile.css'];
	assert.match(search, /grid-template-columns:\s*minmax\(10rem, 14rem\) minmax\(0, 1fr\)/);
	assert.match(search, /grid-template-columns:\s*6\.75rem minmax\(0, 1fr\)/);
	assert.match(search, /series-search-row[\s\S]*inline-size:\s*100%\s*!important/);
	assert.doesNotMatch(mobile, /living-path-search-stack|living-path-field|series-search-row|filter-chip/);
});

test('Torah branch cards drop generic social ornament', () => {
	const cards = sources['cards.css'];
	assert.match(cards, /clip-path:\s*none\s*!important/);
	assert.match(cards, /\.series-nav-card/);
	assert.match(cards, /> \.nav-card-media[\s\S]*display:\s*none\s*!important/);
	assert.match(cards, /\.nav-card-kicker[\s\S]*display:\s*none\s*!important/);
});

test('context and focused workspaces remove redundant chrome', () => {
	const context = sources['context.css'];
	const focus = sources['focus.css'];
	const workspaces = sources['workspaces.css'];
	assert.match(context, /living-path-full-path/);
	for (const token of ['.heichel-os-world-panel', '.heichel-profile-tabs', '.geelooy-bottom-nav']) {
		assert.ok(focus.includes(token));
	}
	assert.match(workspaces, /\.awtsmoos-platform-panel/);
	assert.match(workspaces, /\.translation-hub-intro/);
	assert.match(workspaces, /\.living-path-result-status/);
});
