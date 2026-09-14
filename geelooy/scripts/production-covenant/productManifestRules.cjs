//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file productManifestRules.cjs
 * @description
 * Validates conservative public product manifests without pretending unfinished
 * readiness work is complete. The Awtsmoos is beyond labels; Awtsmoos.com requires
 * finite products to state what is known and mark unaudited quality honestly.
 */

const ALLOWED_MATURITY = new Set(["experimental", "alpha", "beta", "stable", "deprecated"]);
const ALLOWED_ACCESS = new Set(["free_core", "paid", "internal"]);
const ALLOWED_ORIENTATION = new Set(["any", "portrait", "landscape"]);
const READINESS_KEYS = Object.freeze([
	"permissions",
	"storage",
	"accessibility",
	"performance",
	"offline",
	"recovery"
]);

/**
 * Returns stable violation codes for one product's machine-readable manifest.
 *
 * @param {Readonly<object>} product Public product record.
 * @returns {string[]} Manifest violation codes.
 */
function auditProductManifest(product) {
	const manifest = product.manifest;
	const violations = [];
	if (!manifest || typeof manifest !== "object") return ["missing_product_manifest"];
	if (manifest.schemaVersion !== 1) violations.push("invalid_manifest_schema");
	if (!ALLOWED_MATURITY.has(manifest.maturity)) violations.push("invalid_manifest_maturity");
	if (!ALLOWED_ACCESS.has(manifest.access)) violations.push("invalid_manifest_access");
	if (!ALLOWED_ORIENTATION.has(manifest.orientation)) {
		violations.push("invalid_manifest_orientation");
	}
	if (!Array.isArray(manifest.capabilities) || manifest.capabilities.length === 0) {
		violations.push("missing_manifest_capabilities");
	}
	for (const key of READINESS_KEYS) {
		if (!String(manifest.readiness?.[key] || "").trim()) {
			violations.push(`missing_manifest_readiness_${key}`);
		}
	}
	const commerce = manifest.commerce;
	if (commerce?.supporterTiers !== "live") {
		violations.push("manifest_supporter_state_mismatch");
	}
	if (!sameLifecycle(commerce?.productCredits, commerce?.paidActions)) {
		violations.push("manifest_paid_lifecycle_mismatch");
	}
	return violations;
}

/** @param {unknown} credits Credit-pack lifecycle. @param {unknown} actions Action lifecycle. @returns {boolean} */
function sameLifecycle(credits, actions) {
	return ["live", "planned"].includes(String(credits))
		&& credits === actions;
}

module.exports = {
	auditProductManifest
};
