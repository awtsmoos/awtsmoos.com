//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file productRules.cjs
 * @description
 * Audits platform product identity and commerce invariants without mutating Wallet
 * state. The Awtsmoos is beyond every finite catalog; Awtsmoos.com still requires
 * every public product to have one verified route and economically honest offerings.
 */

const {
	listCommerceProducts
} = require("../../api/wallet/core/commerce/platform/productDirectory.js");
const {
	SUPPORTER_SKUS
} = require("../../api/wallet/core/commerce/supporterCatalog.js");
const {
	CREDIT_PACK_SKUS
} = require("../../api/wallet/core/commerce/creditPackCatalog.js");
const {
	hasLivePaidActionForProduct
} = require("../../api/wallet/core/commerce/paidActionCatalog.js");
const {
	auditProductManifest
} = require("./productManifestRules.cjs");

/**
 * Audits every deployed product against route and monetization truth.
 *
 * @returns {{ok:boolean,products:number,violations:object[]}}
 * 	Machine-readable product covenant report.
 */
function auditProductCommerce() {
	const products = listCommerceProducts();
	const violations = [];
	const seenRoutes = new Set();

	for (const product of products) {
		auditIdentity(product, seenRoutes, violations);
		auditManifest(product, violations);
		auditCommerce(product, violations);
	}

	return {
		ok: violations.length === 0,
		products: products.length,
		violations
	};
}

/** @param {object} product Product record. @param {Set<string>} seenRoutes Route set. @param {object[]} violations Output. */
function auditIdentity(product, seenRoutes, violations) {
	if (!product.id || !String(product.route || "").startsWith("/")) {
		violations.push(issue(product.id, "invalid_product_identity"));
	}
	if (seenRoutes.has(product.route)) {
		violations.push(issue(product.id, "duplicate_public_route"));
	}
	seenRoutes.add(product.route);
}

/** @param {object} product Product record. @param {object[]} violations Output. */
function auditManifest(product, violations) {
	for (const code of auditProductManifest(product)) {
		violations.push(issue(product.id, code));
	}
}

/** @param {object} product Product record. @param {object[]} violations Output. */
function auditCommerce(product, violations) {
	const supporters = SUPPORTER_SKUS.filter((sku) => sku.productId === product.id);
	const credits = CREDIT_PACK_SKUS.filter((sku) => sku.productId === product.id);
	const liveAction = hasLivePaidActionForProduct(product.id);

	if (supporters.length !== 3 || !supporters.every(validSupporter)) {
		violations.push(issue(product.id, "invalid_supporter_tiers"));
	}
	if (credits.length !== 3) {
		violations.push(issue(product.id, "invalid_credit_pack_count"));
	}
	if (!credits.every((sku) => sku.available === liveAction)) {
		violations.push(issue(product.id, "credit_pack_fulfillment_mismatch"));
	}
}

/** @param {object} sku Supporter SKU. @returns {boolean} Whether it honors live durable rules. */
function validSupporter(sku) {
	return sku.available === true
		&& sku.kind === "durable_entitlement"
		&& sku.spendPolicy === "purchased_only";
}

/** @param {string} productId Product identity. @param {string} code Violation code. @returns {object} */
function issue(productId, code) {
	return { productId, code };
}

module.exports = {
	auditProductCommerce
};