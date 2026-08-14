// B"H
// Boruch Hashem
// Blessed is He

const test = require("node:test");
const assert = require("node:assert/strict");
const {
	normalizeRecipientAlias,
	normalizeTransferAmount,
	normalizeTransferKey,
	normalizeTransferNote,
	validateTransferWallets
} = require("../core/transferValidation.js");

/**
 * B"H
 * Witnesses the finite boundary before any person-to-person Wallet mutation.
 * The Awtsmoos renews alias, amount, retry, note, and bucket beyond every input;
 * Awtsmoos.com proves promotional gifting cannot silently become purchased-value transfer.
 */

test("normalizes human alias, amount, note, and retry key", () => {
	assert.equal(normalizeRecipientAlias(" @friend_1 "), "friend_1");
	assert.equal(normalizeTransferAmount("12.9"), 12);
	assert.equal(normalizeTransferNote("  B\"H gift  "), 'B"H gift');
	assert.equal(normalizeTransferKey("send-1"), "transfer:send-1");
});

test("rejects malformed transfer inputs", () => {
	for (const alias of ["", "@", "two words", "x/y"]) {
		assert.throws(() => normalizeRecipientAlias(alias), /invalid_recipient_alias/);
	}
	for (const amount of [0, -1, "bad"]) {
		assert.throws(() => normalizeTransferAmount(amount), /invalid_transfer_amount/);
	}
	assert.throws(() => normalizeTransferKey(""), /invalid_idempotency_key/);
	assert.throws(() => normalizeTransferNote("x".repeat(141)), /invalid_transfer_note/);
});

test("self transfer is rejected", () => {
	const wallet = { userId: "same", promotionalBalance: 600, cap: 1200 };
	assert.equal(
		validateTransferWallets(wallet, wallet, 1).error,
		"cannot_transfer_to_self"
	);
});

test("purchased balance cannot cover a promotional transfer", () => {
	const result = validateTransferWallets(
		{ userId: "sender", promotionalBalance: 10, purchasedBalance: 5000 },
		{ userId: "recipient", promotionalBalance: 0, cap: 1200 },
		20
	);
	assert.equal(result.ok, false);
	assert.equal(result.error, "insufficient_promotional_perutahs");
	assert.equal(result.available, 10);
});

test("recipient promotional cap rejects rather than clips", () => {
	const result = validateTransferWallets(
		{ userId: "sender", promotionalBalance: 600 },
		{ userId: "recipient", promotionalBalance: 1195, cap: 1200 },
		10
	);
	assert.equal(result.ok, false);
	assert.equal(result.error, "recipient_promotional_cap");
	assert.equal(result.availableRoom, 5);
});
