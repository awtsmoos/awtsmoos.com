//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file creditPackCatalog.js
 * @description
 * Generates server-priced product credit packs while refusing to sell empty promises.
 * A pack becomes live only after the product has at least one real server-authoritative
 * paid-action adapter; supporter tiers remain the universal monetization fallback.
 */

const { defineSku } = require("./sku.js");
const { hasLivePaidActionForProduct } = require("./paidActionCatalog.js");
const { SUPPORTER_PRODUCTS } = require("./supporterCatalog.js");

const CREDIT_PACK_TIERS = Object.freeze([
	Object.freeze({ code: "spark", units: 50, pricePerutahs: 50000 }),
	Object.freeze({ code: "creator", units: 250, pricePerutahs: 200000 }),
	Object.freeze({ code: "power", units: 1000, pricePerutahs: 600000 })
]);

/**
 * Builds three packs for one product, preserving roadmap visibility while fulfillment is planned.
 * @param {{id:string,title:string}} product Canonical commerce product.
 * @returns {Readonly<object>[]} Product credit pack SKUs.
 */
function createCreditPackSkus(product) {
	const available = hasLivePaidActionForProduct(product.id);
	return CREDIT_PACK_TIERS.map(tier => defineSku({
		id: `${product.id}.credits.${tier.code}.001`,
		title: `${product.title} · ${tier.units} Credits`,
		description: `${tier.units} account-bound ${product.title} premium-usage credits.`,
		productId: product.id,
		kind: "consumable_credit_pack",
		pricePerutahs: tier.pricePerutahs,
		spendPolicy: "purchased_only",
		creditUnits: tier.units,
		creditLabel: `${product.title} Credits`,
		available
	}));
}

/** @returns {Readonly<object>[]} Complete generated credit catalog. */
function createCreditPackCatalog() {
	return Object.freeze(SUPPORTER_PRODUCTS.flatMap(createCreditPackSkus));
}

const CREDIT_PACK_SKUS = createCreditPackCatalog();

module.exports = {
	CREDIT_PACK_TIERS,
	CREDIT_PACK_SKUS,
	createCreditPackCatalog,
	createCreditPackSkus
};
