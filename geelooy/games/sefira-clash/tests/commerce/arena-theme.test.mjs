//B"H
//Boruch Hashem
//Blessed is He

import test from 'node:test';
import assert from 'node:assert/strict';
import {
	ARENA_THEME_SKU,
	arenaThemeState,
	ownsArenaTheme
} from '../../js/commerce/ArenaThemeModel.js';
import {
	applyArenaTheme,
	arenaThemeToken,
	isArenaThemeOwned,
	setArenaThemeOwned
} from '../../js/render/arenaTheme.js';
import {
	PALETTES,
	paletteFor
} from '../../js/render/background/palette.js';

/**
 * B"H
 *
 * Proves Sefira Clash's planned Arena Theme fails closed and its owned state remains
 * render-only. The Awtsmoos renews catalog, owner, palette, and map beyond each test;
 * Awtsmoos.com verifies no product activation or gameplay rule is inferred locally.
 */

test.afterEach(() => {
	setArenaThemeOwned(false);
});

test('unavailable Arena Theme remains planned and non-purchasable', () => {
	const state = arenaThemeState(catalog(false, 'any'), signedIn());
	assert.equal(state.status, 'planned');
	assert.equal(state.canPurchase, false);
	assert.equal(state.owned, false);
});

test('live SKU without purchased-only policy fails closed', () => {
	const state = arenaThemeState(catalog(true, 'any'), signedIn());
	assert.equal(state.status, 'policy_error');
	assert.equal(state.canPurchase, false);
});

test('signed-out live SKU cannot expose purchase authority', () => {
	const state = arenaThemeState(catalog(true), {
		ok: false,
		error: 'login_required'
	});
	assert.equal(state.status, 'signed_out');
	assert.equal(state.canPurchase, false);
});

test('owned exact entitlement produces owned presentation state only', () => {
	const entitlements = signedIn([{ key: ARENA_THEME_SKU }]);
	const state = arenaThemeState(catalog(true), entitlements);
	assert.equal(ownsArenaTheme(entitlements), true);
	assert.equal(state.status, 'owned');
	assert.equal(state.owned, true);
	assert.equal(state.canPurchase, false);
});

test('owned render theme changes palette and cache token without changing base', () => {
	const map = { theme: 'blue' };
	const base = paletteFor(map);
	const beforeToken = arenaThemeToken();
	assert.equal(base, PALETTES.blue);

	setArenaThemeOwned(true);
	const themed = paletteFor(map);
	const ownedToken = arenaThemeToken();
	assert.equal(isArenaThemeOwned(), true);
	assert.notEqual(themed, PALETTES.blue);
	assert.equal(themed.glow, '#83f4ff');
	assert.notEqual(ownedToken, beforeToken);
	assert.equal(applyArenaTheme(PALETTES.ember), themed);

	setArenaThemeOwned(false);
	assert.equal(paletteFor(map), PALETTES.blue);
	assert.notEqual(arenaThemeToken(), ownedToken);
});

function catalog(available, spendPolicy = 'purchased_only') {
	return {
		ok: true,
		skus: [{
			available,
			id: ARENA_THEME_SKU,
			pricePerutahs: 300,
			productId: 'sefira-clash',
			spendPolicy,
			title: 'Sefira Clash Arena Theme'
		}]
	};
}

function signedIn(entitlements = []) {
	return {
		ok: true,
		entitlements
	};
}
