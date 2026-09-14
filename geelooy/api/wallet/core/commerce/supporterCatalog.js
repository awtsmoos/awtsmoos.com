// B"H
// Boruch Hashem
// Blessed is He

const { SUPPORTER_APP_PRODUCTS } = require("./supporterProductsApps.js");
const { SUPPORTER_GAME_PRODUCTS } = require("./supporterProductsGames.js");
const { createSupporterCatalog } = require("./supporterSkuFactory.js");
const {
	discoverProducts,
	supporterProductId
} = require("./platform/productDiscovery.js");

/**
 * Live route discovery is authoritative; curated records only override presentation.
 * This prevents stale or imagined products from becoming purchasable catalog goods.
 */
const curated = new Map([
	...SUPPORTER_APP_PRODUCTS,
	...SUPPORTER_GAME_PRODUCTS
].map(product => [product.id, product]));

const SUPPORTER_PRODUCTS = Object.freeze(discoverProducts().map(product => {
	const id = supporterProductId(product);
	return Object.freeze({
		id,
		title: curated.get(id)?.title || product.title
	});
}));

const SUPPORTER_SKUS = createSupporterCatalog(SUPPORTER_PRODUCTS);

module.exports = {
	SUPPORTER_PRODUCTS,
	SUPPORTER_SKUS
};
