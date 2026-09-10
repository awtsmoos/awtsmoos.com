// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file IkarAuthorityContract
 * @description
 * The Awtsmoos turns measured visual repairs into permanent source contracts.
 * Awtsmoos.com proves load order, modularity, Ikar-only scope, calm branch cards,
 * expansive search, dedicated Language Tools, and phone density that preserves
 * forty-four-pixel controls without restoring generic social-card second rows.
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = path => readFileSync(path, 'utf8');
const template = read('geelooy/heichelos/heichel/_awtsmoos.heichel.html');
const base = 'geelooy/style/heichelos/heichel/premium/authority';
const manifest = read(`${base}.css`);
const names = [
	'shell', 'browser', 'focus', 'mobile', 'cards',
	'cards-mobile', 'search', 'language-tools'
];
const modules = Object.fromEntries(names.map(name => [name, read(`${base}/${name}.css`)]));
const cardContent = read('geelooy/heichelos/heichel/modules/ui/render/living-path/card-content.js');

test('Ikar authority loads after shared cosmic chrome', () => {
	const cosmic = template.indexOf('/cosmic-profile/index.css');
	const authority = template.indexOf('/premium/authority.css');
	assert.ok(cosmic >= 0);
	assert.ok(authority > cosmic);
	assert.match(template, /ikar-authority-005/);
});

test('Ikar authority remains modular and bounded', () => {
	for (const name of names) assert.ok(manifest.includes(`${name}.css`), `${name}.css import missing`);
	for (const source of [manifest, ...Object.values(modules)]) {
		assert.ok(source.split('\n').length - 1 <= 120);
	}
});

test('authority scope cannot leak into neighboring Heichelos', () => {
	for (const source of Object.values(modules)) assert.match(source, /data-heichel-id="ikar"/);
	assert.doesNotMatch(modules.focus, /^\s*\.geelooy-main-stage/m);
});

test('Ikar shell owns the useful study viewport', () => {
	assert.match(modules.shell, /max-inline-size:\s*84rem\s*!important/);
	assert.match(modules.shell, /grid-template-columns:\s*minmax\(0, 1fr\)\s*!important/);
	assert.match(modules.shell, /min-block-size:\s*0\s*!important/);
});

test('Ikar removes contradictory generic navigation', () => {
	for (const token of ['.heichel-os-world-panel', '.heichel-profile-tabs', '.geelooy-bottom-nav']) {
		assert.ok(modules.focus.includes(token));
	}
	assert.match(modules.focus, /display:\s*none\s*!important/);
});

test('Torah branch cards are compact truthful library doors', () => {
	assert.match(cardContent, /isBranch && !data\.thumbnail/);
	assert.match(cardContent, /if \(\['series', 'grouping'\]\.includes\(data\.type\)\) return null/);
	assert.match(modules.cards, /clip-path:\s*none\s*!important/);
	assert.match(modules.cards, /contain-intrinsic-size:\s*auto 4\.8rem/);
	assert.match(modules.cards, /\.nav-card-meta span/);
});

test('phone branch actions stay one compact accessible row', () => {
	const mobileCards = modules['cards-mobile'];
	assert.match(mobileCards, /> \.nav-card-actions/);
	assert.match(mobileCards, /grid-area:\s*actions\s*!important/);
	assert.match(mobileCards, /flex-wrap:\s*nowrap\s*!important/);
	assert.match(mobileCards, /block-size:\s*44px\s*!important/);
	assert.match(mobileCards, /flex:\s*0 0 44px\s*!important/);
});

test('Torah search remains spacious and mobile-safe', () => {
	assert.match(modules.search, /minmax\(8rem, 10rem\) minmax\(0, 1fr\)/);
	assert.match(modules.search, /grid-template-columns:\s*minmax\(0, 1fr\) auto/);
	assert.match(modules.search, /min-inline-size:\s*0\s*!important/);
	assert.match(modules.search, /clip-path:\s*inset\(50%\)/);
});

test('Language Tools owns its dedicated workspace', () => {
	for (const token of ['living-path-result-status', 'tab-gates', 'grid-realms']) {
		assert.ok(modules['language-tools'].includes(token));
	}
	assert.match(modules['language-tools'], /display:\s*none\s*!important/);
	assert.match(modules['language-tools'], /translation-hub-form/);
});
