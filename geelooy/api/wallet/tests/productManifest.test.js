//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file productManifest.test.js
 * @description
 * Proves every verified product publishes conservative quality readiness while its
 * commerce declaration follows actual server fulfillment truth. The Awtsmoos is
 * beyond declaration and commerce; Awtsmoos.com refuses both premature quality claims
 * and stale "planned" labels after real paid capability has become executable.
 */

const test = require("node:test");
const assert = require("node:assert/strict");
const {
	listCommerceProducts
} = require("../core/commerce/platform/productDirectory.js");
const {
	hasLivePaidActionForProduct
} = require("../core/commerce/paidActionCatalog.js");

test("every deployed product exposes the baseline manifest schema", () => {
	const products = listCommerceProducts();
	assert.equal(products.length, 80);
	for (const product of products) {
		assert.equal(product.manifest.schemaVersion, 1);
		assert.equal(product.manifest.maturity, "beta");
		assert.equal(product.manifest.access, "free_core");
		assert.equal(product.manifest.orientation, "any");
		assert.ok(product.manifest.capabilities.length > 0);
		assert.equal(product.manifest.commerce.supporterTiers, "live");
	}
});

test("unaudited quality remains explicit instead of being marketed as complete", () => {
	for (const product of listCommerceProducts()) {
		const readiness = product.manifest.readiness;
		assert.equal(readiness.permissions, "undocumented");
		assert.equal(readiness.storage, "undocumented");
		assert.equal(readiness.accessibility, "audit_required");
		assert.equal(readiness.performance, "audit_required");
		assert.equal(readiness.offline, "audit_required");
		assert.equal(readiness.recovery, "audit_required");
	}
});

test("live handler-backed value makes credits and paid actions honestly live", () => {
	for (const product of listCommerceProducts()) {
		assert.equal(hasLivePaidActionForProduct(product.id), true, product.id);
		assert.equal(product.manifest.commerce.productCredits, "live", product.id);
		assert.equal(product.manifest.commerce.paidActions, "live", product.id);
	}
});
