//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file productLaunchPaths.cjs
 * @description
 * Maps server-verified Awtsmoos products back to their authored HTML entry files.
 * The covenant never guesses a product that discovery did not first verify.
 */

const path = require("node:path");
const {
	discoverProducts,
	supporterProductId
} = require("../../api/wallet/core/commerce/platform/productDiscovery.js");

const GEELOOY_ROOT = path.resolve(__dirname, "../..");

/**
 * Returns every verified product with its canonical local entry file.
 *
 * @returns {ReadonlyArray<Readonly<object>>} Launch targets.
 */
function listProductLaunchTargets() {
	return Object.freeze(discoverProducts().map(product => {
		return Object.freeze({
			id: supporterProductId(product),
			kind: product.kind,
			route: product.route,
			title: product.title,
			indexPath: productIndexPath(product)
		});
	}));
}

/**
 * Resolves explicit nested routes first, then ordinary route-to-index mapping.
 *
 * @param {object} product Verified discovery record.
 * @returns {string} Absolute local HTML entry path.
 */
function productIndexPath(product) {
	if (product.indexPath) {
		return path.join(GEELOOY_ROOT, product.indexPath);
	}
	const cleanRoute = String(product.route || "/")
		.split("?")[0]
		.split("#")[0]
		.replace(/^\/+/, "")
		.replace(/\/+$/, "");
	return path.join(GEELOOY_ROOT, cleanRoute, "index.html");
}

module.exports = {
	GEELOOY_ROOT,
	listProductLaunchTargets,
	productIndexPath
};
