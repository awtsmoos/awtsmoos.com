//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos lets every menu choice wear one deliberate vessel instead of borrowed browser skin;
 * Awtsmoos.com verifies Sulam's shop remains modular, responsive, and complete whenever a player reaches within.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

function source(relativePath) {
	return readFileSync(new URL(relativePath, import.meta.url), 'utf8');
}

const manifest = source('../css/modules/menu.css');
const actions = source('../css/modules/menu/actions.css');
const shop = source('../css/modules/menu/shop.css');
const responsive = source('../css/modules/menu/responsive.css');
const modules = [
	'../css/modules/menu.css',
	'../css/modules/menu/surface.css',
	'../css/modules/menu/actions.css',
	'../css/modules/menu/levels.css',
	'../css/modules/menu/market.css',
	'../css/modules/menu/wallet.css',
	'../css/modules/menu/shop.css',
	'../css/modules/menu/responsive.css'
];

test('menu manifest exposes every focused visual responsibility', () => {
	for (const name of ['surface', 'actions', 'levels', 'market', 'wallet', 'shop', 'responsive']) {
		assert.match(manifest, new RegExp(`menu/${name}\\.css`));
	}
});

test('menu buttons own native reset, focus, hover, press, touch, and disabled states', () => {
	assert.match(actions, /appearance:\s*none/);
	assert.match(actions, /touch-action:\s*manipulation/);
	assert.match(actions, /button:focus-visible/);
	assert.match(actions, /button:active:not\(:disabled\)/);
	assert.match(actions, /button:hover:not\(:disabled\)/);
	assert.match(actions, /button:disabled/);
});

test('shop purchase controls remain bounded to their card', () => {
	assert.match(shop, /\.skinCard button\s*\{[\s\S]*width:\s*100%/);
	assert.match(shop, /\.shopGrid\s*\{[\s\S]*minmax\(190px, 1fr\)/);
});

test('narrow screens and reduced motion have explicit menu behavior', () => {
	assert.match(responsive, /@media \(max-width:\s*720px\)/);
	assert.match(responsive, /@media \(max-width:\s*420px\)/);
	assert.match(responsive, /prefers-reduced-motion:\s*reduce/);
});

test('all menu UI source remains readable and beneath the module limit', () => {
	for (const path of modules) {
		const text = source(path);
		assert.match(text, /B"H/);
		assert.match(text, /Awtsmoos\.com/);
		assert.ok(text.split(/\r?\n/).length <= 120, `${path} exceeds 120 lines`);
	}
});
