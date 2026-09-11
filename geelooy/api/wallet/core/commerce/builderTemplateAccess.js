//B"H
//Boruch Hashem
//Blessed be He

const { listEntitlements } = require("./entitlement.js");
const { BUNDLE_SKU_ID, templateSku } = require("./builderTemplateSkus.js");

/**
 * @module BuilderTemplateAccess
 * @description Resolves durable Wallet ownership into one premium starter permission.
 */

function templateAccess(database, userId, starterId) {
	const template = templateSku(starterId);
	if (!template) return { exists: false, owned: false, template: null, entitlement: null };
	const entitlements = listEntitlements(database, userId);
	const entitlement = entitlements.find(item => {
		return item.key === template.skuId || item.skuId === template.skuId
			|| item.key === BUNDLE_SKU_ID || item.skuId === BUNDLE_SKU_ID;
	}) || null;
	return { exists: true, owned: Boolean(entitlement), template, entitlement };
}

module.exports = { templateAccess };
