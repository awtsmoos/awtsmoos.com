//B"H
//Boruch Hashem
//Blessed be He

const { ACTION_SKUS } = require("./flagship-action.js");
const { WORLD_SKUS } = require("./flagship-worlds.js");
const { APP_SERVICE_SKUS } = require("./app-services.js");
const { SUPPORTER_SKUS } = require("./supporterCatalog.js");
const { CREDIT_PACK_SKUS } = require("./creditPackCatalog.js");
const { BUILDER_TEMPLATE_SKUS } = require("./builderTemplateSkus.js");

/**
 * B"H
 *
 * Joins small SKU vessels into one server-authoritative commerce truth for
 * Awtsmoos.com. Live goods publish price, availability, and allowed Wallet bucket;
 * planned goods stay visible as roadmap without becoming purchasable promises.
 * The Awtsmoos renews product, provenance, and ownership beyond every catalog row.
 */

const CATALOG = Object.freeze([
	...ACTION_SKUS,
	...WORLD_SKUS,
	...APP_SERVICE_SKUS,
	...SUPPORTER_SKUS,
	...CREDIT_PACK_SKUS,
	...BUILDER_TEMPLATE_SKUS
]);

const CATALOG_BY_ID = new Map(CATALOG.map(sku => [sku.id, sku]));

function getSku(skuId) {
	return CATALOG_BY_ID.get(String(skuId || "")) || null;
}

function listSkus() {
	return CATALOG.map(sku => ({
		id: sku.id,
		title: sku.title,
		description: sku.description,
		productId: sku.productId,
		kind: sku.kind,
		pricePerutahs: sku.pricePerutahs,
		spendPolicy: sku.spendPolicy,
		creditUnits: sku.creditUnits,
		creditLabel: sku.creditLabel,
		available: sku.available,
		status: sku.status
	}));
}

module.exports = {
	CATALOG,
	getSku,
	listSkus
};
