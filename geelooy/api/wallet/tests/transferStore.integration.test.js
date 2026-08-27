// B"H
// Boruch Hashem
// Blessed is He

const path = require("path");
const os = require("os");
const fsp = require("fs/promises");
const test = require("node:test");
const assert = require("node:assert/strict");

const dataDir = path.join(os.tmpdir(), `awtsmoos-wallet-transfer-${process.pid}`);
process.env.AWTSMOOS_WALLET_DATA_DIR = dataDir;

const {
	creditOnce,
	getWallet,
	transferPromotionalOnce
} = require("../core/store.js");

/**
 * B"H
 * Proves promotional person-to-person movement against isolated durable Wallet
 * storage. The Awtsmoos renews giver, receiver, retry, cap, and purchased bucket;
 * Awtsmoos.com touches no production balance while testing exact persistence behavior.
 */

test.beforeEach(async () => {
	await fsp.rm(dataDir, { recursive: true, force: true });
});

test.after(async () => {
	await fsp.rm(dataDir, { recursive: true, force: true });
});

test("moves promotional Perutas and writes mirrored transfer history", async () => {
	const result = await transferPromotionalOnce(spec({ amount: 100 }));
	assert.equal(result.ok, true);
	assert.equal(result.deduplicated, false);
	assert.equal(result.wallet.promotionalBalance, 500);
	assert.equal(result.wallet.purchasedBalance, 0);
	assert.equal(result.transfer.recipientAlias, "friend");
	assert.equal(JSON.stringify(result).includes("recipient-user"), false);

	const recipient = await getWallet("recipient-user");
	assert.equal(recipient.promotionalBalance, 700);
	const outgoing = result.wallet.recent.find(tx => tx.type === "transfer_out");
	const incoming = recipient.recent.find(tx => tx.type === "transfer_in");
	assert.ok(outgoing);
	assert.ok(incoming);
	assert.equal(outgoing.meta.transferId, incoming.meta.transferId);
	assert.equal(outgoing.meta.recipientAlias, "friend");
	assert.equal(incoming.meta.senderAlias, "sender");
});

test("same retry key cannot double-send and conflicts on changed details", async () => {
	const first = await transferPromotionalOnce(spec({ amount: 75, idempotencyKey: "stable" }));
	const duplicate = await transferPromotionalOnce(spec({ amount: 75, idempotencyKey: "stable" }));
	const conflict = await transferPromotionalOnce(spec({ amount: 76, idempotencyKey: "stable" }));
	assert.equal(first.ok, true);
	assert.equal(duplicate.ok, true);
	assert.equal(duplicate.deduplicated, true);
	assert.equal(duplicate.transfer.transferId, first.transfer.transferId);
	assert.equal(conflict.ok, false);
	assert.equal(conflict.error, "idempotency_conflict");
	assert.equal((await getWallet("sender-user")).promotionalBalance, 525);
	assert.equal((await getWallet("recipient-user")).promotionalBalance, 675);
});

test("purchased Perutas remain non-transferable", async () => {
	await creditOnce("sender-user", 1000, "purchase", {
		balanceKind: "purchased",
		idempotencyKey: "paid"
	});
	const result = await transferPromotionalOnce(spec({ amount: 700 }));
	assert.equal(result.ok, false);
	assert.equal(result.error, "insufficient_promotional_perutahs");
	const sender = await getWallet("sender-user");
	assert.equal(sender.promotionalBalance, 600);
	assert.equal(sender.purchasedBalance, 1000);
	assert.equal(sender.balance, 1600);
});

test("recipient cap overflow rejects without moving transfer value", async () => {
	await creditOnce("recipient-user", 600, "promo_fill", {
		idempotencyKey: "cap",
		balanceKind: "promotional"
	});
	const result = await transferPromotionalOnce(spec({ amount: 1 }));
	assert.equal(result.ok, false);
	assert.equal(result.error, "recipient_promotional_cap");
	assert.equal((await getWallet("sender-user")).promotionalBalance, 600);
	assert.equal((await getWallet("recipient-user")).promotionalBalance, 1200);
});

function spec(overrides = {}) {
	return {
		amount: 100,
		idempotencyKey: `key-${Math.random()}`,
		note: 'B"H gift',
		recipientAlias: "friend",
		recipientUserId: "recipient-user",
		senderAlias: "sender",
		senderUserId: "sender-user",
		...overrides
	};
}
