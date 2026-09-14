//B"H
//Boruch Hashem
//Blessed be He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const test = require("node:test");
const { creditWalletBucket } = require("../core/balanceBuckets.js");
const { BUILDER_TEMPLATE_SKUS, BUNDLE_SKU_ID } = require("../core/commerce/builderTemplateSkus.js");
const { deliverBuilderTemplate } = require("../core/commerce/builderTemplateDelivery.js");
const { getSku } = require("../core/commerce/catalog.js");
const { purchaseInsideTransaction } = require("../core/commerce/purchaseMutation.js");
const { emptyWalletDb } = require("../core/persistence.js");
const { ensureWallet } = require("../core/transactionRunner.js");
const { routeTable } = require("../routes/table.js");

/**
 * @file builderTemplateCommerce.test.js
 * @description Proves premium Builder source is a purchased-only protected digital good with real bundle ownership.
 */

test("Builder template catalog exposes three singles and one discounted bundle", () => {
	assert.equal(BUILDER_TEMPLATE_SKUS.length, 4);
	assert.deepEqual(BUILDER_TEMPLATE_SKUS.map(item => item.pricePerutahs), [1000000, 1000000, 1000000, 2500000]);
	assert.equal(BUILDER_TEMPLATE_SKUS.every(item => item.available && item.spendPolicy === "purchased_only"), true);
	assert.equal(typeof routeTable["commerce/digital-good"], "function");
});

test("unowned premium source is not delivered", () => {
	const database = emptyWalletDb();
	assert.throws(
		() => deliverBuilderTemplate(database, "buyer", "launch-pro", "Acme"),
		error => error.code === "digital_good_not_owned" && error.statusCode === 403
	);
});

test("single template purchase debits purchased value and unlocks editable source", () => {
	const database = fundedDatabase("buyer", 1500000);
	const sku = getSku("drive.template.launch.001");
	const purchase = purchaseInsideTransaction(database, "buyer", sku, "template-buy-1");
	assert.equal(purchase.ok, true);
	assert.equal(database.wallets.buyer.purchasedBalance, 500000);
	const good = deliverBuilderTemplate(database, "buyer", "launch-pro", "Acme & Sons");
	assert.equal(good.skuId, sku.id);
	assert.match(good.files["index.html"], /Acme &amp; Sons/);
	assert.match(good.files["styles.css"], /feature-grid/);
	assert.doesNotMatch(good.files["index.html"], /https?:\/\//);
});

test("bundle entitlement unlocks every premium template", () => {
	const database = fundedDatabase("bundle-buyer", 3000000);
	const purchase = purchaseInsideTransaction(database, "bundle-buyer", getSku(BUNDLE_SKU_ID), "template-bundle-1");
	assert.equal(purchase.ok, true);
	for (const starterId of ["launch-pro", "agency-pro", "saas-pro"]) {
		assert.equal(deliverBuilderTemplate(database, "bundle-buyer", starterId, "Bundle Site").starterId, starterId);
	}
});

test("public Builder starter catalog contains premium metadata but not premium source", () => {
	const source = fs.readFileSync(require.resolve("../../../drive/builder/starterCatalog.js"), "utf8");
	assert.match(source, /Launch Pro/);
	assert.doesNotMatch(source, /Every section earns its place/);
	assert.doesNotMatch(source, /price-card/);
});

function fundedDatabase(userId, purchasedPerutahs) {
	const database = emptyWalletDb();
	const wallet = ensureWallet(database, userId);
	creditWalletBucket(wallet, purchasedPerutahs, "purchased");
	return database;
}
