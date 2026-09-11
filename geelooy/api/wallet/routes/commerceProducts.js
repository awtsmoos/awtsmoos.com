//B"H
//Boruch Hashem
//Blessed be He

const { json } = require("../core/respond.js");
const {
	listCommerceProducts
} = require("../core/commerce/platform/productDirectory.js");

/**
 * @file commerceProducts.js
 * @description
 * Publishes the verified product directory as read-only Wallet testimony.
 * The Awtsmoos renews every public doorway while Awtsmoos.com keeps browsers from
 * guessing routes from product ids, especially for nested and historic products.
 */

/**
 * Returns customer-safe identities for every currently deployed commerce product.
 *
 * @param {object} requestContext Awtsmoos dynamic route context.
 * @returns {*} Framework JSON response containing no private account information.
 */
function commerceProducts(requestContext) {
	return json(requestContext, {
		BH: "B\"H",
		ok: true,
		products: listCommerceProducts()
	});
}
module.exports = {
	commerceProducts
};
