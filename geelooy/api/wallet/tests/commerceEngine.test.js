// B"H
// Boruch Hashem
// Blessed is He

const test = require("node:test");
const assert = require("node:assert/strict");
const os = require("os");
const path = require("path");
const fsp = require("fs/promises");

const testDataDirectory = path.join(
	os.tmpdir(),
	`awtsmoos-commerce-${process.pid}-${Date.now()}`
);
process.env.AWTSMOOS_WALLET_DATA_DIR = testDataDirectory;

const { defineSku } = require("../core/commerce/sku.js");
const { CATALOG } = require("../core/commerce/catalog.js");
const { SUPPORTER_SKUS } = require("../core/commerce/supporterCatalog.js");
const { CREDIT_PACK_SKUS } = require("../core/commerce/creditPackCatalog.js");
const { BUILDER_TEMPLATE_SKUS } = require("../core/commerce/builderTemplateSkus.js");
const { purchaseSku } = require("../core/commerce/purchaseEngine.js");
const { getWallet } = require("../core/store.js");
const { getCommerceAccount } = require("../core/commerce/access.js");

/**
 * @file commerceEngine.test.js
 * @description
 * Witnesses atomic Wallet commerce against isolated storage. The Awtsmoos renews
 * debit, entitlement, receipt, and receiving product; Awtsmoos.com proves four
 * fulfilled durable goods stay purchased-only after the tiny-Perutah price migration.
 */

const AVAILABLE_SKU = defineSku({
	id: "test.cosmetic.001",
	title: "Test Cosmetic",
	productId: "test-world",
	pricePerutahs: 125,
	available: true
});

const EXPENSIVE_SKU = defineSku({
	id: "test.expensive.001",
	title: "Expensive Test Cosmetic",
	productId: "test-world",
	pricePerutahs: 900,
	available: true
});

test.after(async () => {
	await fsp.rm(testDataDirectory, { recursive: true, force: true });
});

test("production catalog keeps unfulfilled credit packs unavailable", () => {
	const live = CATALOG.filter((sku) => sku.available);
	const specialLive = live.filter((sku) => {
		return sku.kind === "durable_entitlement" && !sku.id.includes(".supporter.");
	});
	const walletLive = specialLive.filter((sku) => sku.productId === "wallet");
	const merkava = specialLive.find((sku) => sku.productId === "merkava");
	assert.equal(CATALOG.length, 23 + SUPPORTER_SKUS.length + CREDIT_PACK_SKUS.length + BUILDER_TEMPLATE_SKUS.length);
	assert.equal(live.length, 4 + SUPPORTER_SKUS.length + BUILDER_TEMPLATE_SKUS.length);
	assert.equal(walletLive.length, 3);
	assert.equal(merkava?.id, "merkava.commander.sigil.001");
	assert.equal(merkava?.pricePerutahs, 38400);
	assert.equal(CREDIT_PACK_SKUS.some((sku) => sku.available), false);
	assert.equal(live.every((sku) => sku.spendPolicy === "purchased_only"), true);
});

test("purchase atomically debits server price and grants durable ownership", async () => {
	const result = await purchaseSku("commerce-user", AVAILABLE_SKU, "purchase-test-001");
	const commerce = await getCommerceAccount("commerce-user");
	assert.equal(result.ok, true);
	assert.equal(result.wallet.balance, 475);
	assert.equal(result.receipt.pricePerutahs, 125);
	assert.equal(commerce.entitlements.length, 1);
	assert.equal(commerce.receipts.length, 1);
});

test("duplicate operation key does not debit or grant twice", async () => {
	const result = await purchaseSku("commerce-user", AVAILABLE_SKU, "purchase-test-001");
	const wallet = await getWallet("commerce-user");
	const commerce = await getCommerceAccount("commerce-user");
	assert.equal(result.ok, true);
	assert.equal(result.deduplicated, true);
	assert.equal(wallet.balance, 475);
	assert.equal(commerce.entitlements.length, 1);
	assert.equal(commerce.receipts.length, 1);
});

test("durable SKU cannot be purchased twice under a new key", async () => {
	const result = await purchaseSku("commerce-user", AVAILABLE_SKU, "purchase-test-002");
	assert.equal(result.ok, false);
	assert.equal(result.error, "already_owned");
	assert.equal((await getWallet("commerce-user")).balance, 475);
});

test("insufficient balance leaves value and ownership unchanged", async () => {
	const result = await purchaseSku("commerce-user", EXPENSIVE_SKU, "purchase-test-003");
	const wallet = await getWallet("commerce-user");
	const commerce = await getCommerceAccount("commerce-user");
	assert.equal(result.ok, false);
	assert.equal(result.error, "insufficient_perutahs");
	assert.equal(wallet.balance, 475);
	assert.equal(commerce.entitlements.length, 1);
});
