//B"H
// Boruch Hashem
// Blessed is He

import test from 'node:test';
import assert from 'node:assert/strict';
import {
	COMMANDER_SIGIL_SKU,
	commanderSigilState,
	findCommanderSigilSku,
	ownsCommanderSigil
} from '../src/commerce/CommanderSigilModel.js';

/**
 * B"H
 *
 * Witnesses that Merkava's cosmetic consumer never invents price, provenance, or
 * ownership. The Awtsmoos renews catalog and owner; Awtsmoos.com proves the Sigil
 * remains presentational while its new two-Maneh tiny-Perutah price comes only from
 * server testimony and unsafe states fail closed without changing gameplay.
 */

test('planned server SKU remains non-purchasable', () => {
	const state = commanderSigilState(catalog(false, 'any'), signedIn());
	assert.equal(state.status, 'planned');
	assert.equal(state.canPurchase, false);
	assert.equal(state.pricePerutahs, 38400);
});

test('live SKU without purchased-only policy fails closed', () => {
	const state = commanderSigilState(catalog(true, 'any'), signedIn());
	assert.equal(state.status, 'policy_error');
	assert.equal(state.canPurchase, false);
});

test('signed-out live SKU shows account state without purchase authority', () => {
	const state = commanderSigilState(catalog(true), {
		ok: false,
		error: 'login_required'
	});
	assert.equal(state.status, 'signed_out');
	assert.equal(state.canPurchase, false);
});

test('authenticated unowned account may purchase a safe live SKU', () => {
	const state = commanderSigilState(catalog(true), signedIn());
	assert.equal(state.status, 'available');
	assert.equal(state.canPurchase, true);
	assert.equal(state.pricePerutahs, 38400);
	assert.equal(state.spendPolicy, 'purchased_only');
});

test('owned entitlement equips the cosmetic and disables purchase', () => {
	const entitlements = signedIn([
		{ key: COMMANDER_SIGIL_SKU }
	]);
	const state = commanderSigilState(catalog(true), entitlements);
	assert.equal(state.status, 'owned');
	assert.equal(state.owned, true);
	assert.equal(state.canPurchase, false);
});

test('unrelated durable entitlement cannot unlock Commander Sigil', () => {
	const entitlements = signedIn([
		{ key: 'wallet.treasury.gold.001' }
	]);
	assert.equal(ownsCommanderSigil(entitlements), false);
	assert.equal(
		commanderSigilState(catalog(true), entitlements).status,
		'available'
	);
});

test('catalog lookup uses only the exact Commander Sigil identity', () => {
	assert.equal(findCommanderSigilSku({ skus: [] }), null);
	assert.equal(findCommanderSigilSku(catalog(true)).id, COMMANDER_SIGIL_SKU);
});

function catalog(available, spendPolicy = 'purchased_only') {
	return {
		ok: true,
		skus: [{
			available,
			description: 'Cosmetic only',
			id: COMMANDER_SIGIL_SKU,
			pricePerutahs: 38400,
			productId: 'merkava',
			spendPolicy,
			title: 'Merkava Commander Sigil'
		}]
	};
}

function signedIn(entitlements = []) {
	return {
		ok: true,
		entitlements
	};
}
