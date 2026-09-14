// B"H
// Boruch Hashem
// Blessed is He

const test = require("node:test");
const assert = require("node:assert/strict");
const os = require("os");
const path = require("path");
const fsp = require("fs/promises");

const dataDir = path.join(os.tmpdir(), `awtsmoos-commerce-idem-${process.pid}`);
process.env.AWTSMOOS_WALLET_DATA_DIR = dataDir;

const { defineSku } = require("../core/commerce/sku.js");
const { purchaseSku } = require("../core/commerce/purchaseEngine.js");

const FIRST = sku("test.first.001", "first");
const SECOND = sku("test.second.001", "second");

function sku(id, productId) {
	return defineSku({ id, title: id, productId, pricePerutahs: 10, available: true });
}

test.beforeEach(async () => {
	await fsp.rm(dataDir, { recursive: true, force: true });
});

test.after(async () => {
	await fsp.rm(dataDir, { recursive: true, force: true });
});

test("one commerce operation key cannot silently purchase a different SKU", async () => {
	const first = await purchaseSku("idem-user", FIRST, "same-operation-key");
	const second = await purchaseSku("idem-user", SECOND, "same-operation-key");
	assert.equal(first.ok, true);
	assert.equal(second.ok, false);
	assert.equal(second.error, "idempotency_conflict");
	assert.equal(second.priorSkuId, FIRST.id);
});
