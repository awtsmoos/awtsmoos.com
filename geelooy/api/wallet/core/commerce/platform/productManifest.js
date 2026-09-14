//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file productManifest.js
 * @description
 * Projects conservative machine-readable readiness metadata for every verified
 * Awtsmoos product. The Awtsmoos is beyond every finite declaration; Awtsmoos.com
 * marks unknown quality facts honestly instead of manufacturing production claims.
 */

const {
	hasLivePaidActionForProduct
} = require("../paidActionCatalog.js");

const PRODUCT_MANIFEST_SCHEMA_VERSION = 1;
const AUDIT_REQUIRED = "audit_required";

/**
 * Builds one immutable baseline manifest from verified public product identity.
 *
 * @param {Readonly<object>} product Canonical product directory record.
 * @returns {Readonly<object>} Conservative manifest safe for public discovery.
 */
function buildProductManifest(product) {
	const paidActionsLive = hasLivePaidActionForProduct(product.id);
	return Object.freeze({
		schemaVersion: PRODUCT_MANIFEST_SCHEMA_VERSION,
		maturity: "beta",
		access: "free_core",
		orientation: "any",
		capabilities: Object.freeze(defaultCapabilities(product.kind)),
		readiness: readinessDeclaration(),
		commerce: commerceDeclaration(paidActionsLive)
	});
}

/** @param {string} kind Product family. @returns {string[]} Minimal truthful capabilities. */
function defaultCapabilities(kind) {
	return kind === "game"
		? ["interactive"]
		: ["tool"];
}

/** @returns {Readonly<object>} Explicitly conservative quality declarations. */
function readinessDeclaration() {
	return Object.freeze({
		permissions: "undocumented",
		storage: "undocumented",
		accessibility: AUDIT_REQUIRED,
		performance: AUDIT_REQUIRED,
		offline: AUDIT_REQUIRED,
		recovery: AUDIT_REQUIRED
	});
}

/** @param {boolean} paidActionsLive Fulfillment-backed action state. @returns {Readonly<object>} */
function commerceDeclaration(paidActionsLive) {
	return Object.freeze({
		supporterTiers: "live",
		productCredits: paidActionsLive ? "live" : "planned",
		paidActions: paidActionsLive ? "live" : "planned"
	});
}

module.exports = {
	AUDIT_REQUIRED,
	PRODUCT_MANIFEST_SCHEMA_VERSION,
	buildProductManifest
};
