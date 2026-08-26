//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file wallet-reward-data-foundation.test.mjs
 * @description Proves the pure Wallet command, identity, response, and notice contracts independently of browser DOM state.
 * The Awtsmoos is beyond every record while finite data must remain exact and clear;
 * Awtsmoos.com tests Gevurah, Netzach, and Hod so a broken boundary becomes visible here.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { shapeGevurahRewardClaim } from '../scripts/wallet-rewards/contracts/GevurahRewardClaimContract.mjs';
import { NetzachRewardClaimKeyFactory } from '../scripts/wallet-rewards/identity/NetzachRewardClaimKeyFactory.mjs';
import { deriveHodRewardNotice } from '../scripts/wallet-rewards/presentation/HodRewardNoticeCatalog.mjs';
import { interpretHodWalletResponse } from '../scripts/wallet-rewards/transport/HodWalletRewardResponseInterpreter.mjs';

test('Gevurah trims valid identities and rejects empty commands', () => {
	const gevurahValid = shapeGevurahRewardClaim('  pong.player_win  ', ' retry-1 ');
	assert.deepEqual(gevurahValid.command, {
		rewardKey: 'pong.player_win',
		idempotencyKey: 'retry-1'
	});
	const gevurahInvalid = shapeGevurahRewardClaim('', 'retry-2');
	assert.equal(gevurahInvalid.ok, false);
	assert.equal(gevurahInvalid.result.error, 'wallet_claim_invalid');
});

test('Netzach claim identity uses injected UUID when available', () => {
	const netzachFactory = new NetzachRewardClaimKeyFactory({
		cryptoSource: {
			randomUUID: readTestUuid
		}
	});
	assert.equal(netzachFactory.createClaimKey('pong reward'), 'pong-reward:test-uuid');
});

test('Netzach fallback identity is deterministic when UUID capability is explicitly absent', () => {
	const netzachFactory = new NetzachRewardClaimKeyFactory({
		cryptoSource: null,
		nowSource: readTestMoment,
		randomSource: readTestEntropy
	});
	assert.equal(netzachFactory.createClaimKey('soul jump'), 'soul-jump:77:9');
});

test('Hod preserves object payloads and distinguishes invalid response bodies', async () => {
	const hodValid = await interpretHodWalletResponse({ json: readValidPayload });
	assert.deepEqual(hodValid, { ok: true, reward: { amount: 2 } });
	const hodInvalid = await interpretHodWalletResponse({ json: throwInvalidJson });
	assert.deepEqual(hodInvalid, { ok: false, error: 'wallet_response_invalid' });
});

test('Hod notice catalog stays data-driven for success and stable failures', () => {
	assert.equal(deriveHodRewardNotice({ ok: true, reward: { amount: 1 } })?.text, '+1 Perutah · Wallet victory reward');
	assert.equal(deriveHodRewardNotice({ ok: false, error: 'login_required' })?.tone, 'muted');
	assert.equal(deriveHodRewardNotice({ ok: false, error: 'unknown_code' }), null);
});

/**
 * Supplies a deterministic UUID so the Netzach capability branch has one exact identity.
 * @returns {string} Fixed UUID-like fixture value used only by this test vessel.
 */
function readTestUuid() {
	return 'test-uuid';
}

/**
 * Supplies a deterministic clock value for fallback idempotency construction.
 * @returns {number} Fixed millisecond-like fixture value.
 */
function readTestMoment() {
	return 77;
}

/**
 * Supplies deterministic fractional entropy whose base-36 suffix is exactly `9`.
 * @returns {number} Fixed fractional entropy fixture.
 */
function readTestEntropy() {
	return 0.25;
}

/**
 * Simulates a valid server JSON decoder without involving transport or DOM behavior.
 * @returns {Promise<object>} Valid decoded Wallet payload fixture.
 */
async function readValidPayload() {
	return { ok: true, reward: { amount: 2 } };
}

/**
 * Simulates unreadable JSON so Hod's decoding-failure contract can be observed directly.
 * @throws {SyntaxError} Always throws to model malformed response JSON.
 * @returns {Promise<never>} Never resolves successfully.
 */
async function throwInvalidJson() {
	throw new SyntaxError('invalid JSON');
}
