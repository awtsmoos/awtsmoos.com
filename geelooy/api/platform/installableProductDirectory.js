//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file installableProductDirectory.js
 * @description
 * Defines the one server-authoritative installable route boundary used by both
 * HTML metadata injection and web-app manifest generation.
 */

const {
	listCommerceProducts
} = require("../wallet/core/commerce/platform/productDirectory.js");

const CORE_PRODUCTS = Object.freeze({
	"/os/": Object.freeze({
		route: "/os/",
		title: "Geelooy OS"
	})
});

/**
 * Normalizes an untrusted route to one absolute trailing-slash path.
 * @param {unknown} value Route-like input.
 * @returns {string} Canonical route.
 */
function normalizeInstallableRoute(value) {
	const path = String(value || "/").split("?")[0].split("#")[0];
	const leading = path.startsWith("/") ? path : `/${path}`;
	return leading.endsWith("/") ? leading : `${leading}/`;
}

/**
 * Resolves one verified commerce product or explicit core platform shell.
 * @param {unknown} routeValue Route-like input.
 * @returns {object|null} Verified installable product testimony.
 */
function installableProductForRoute(routeValue) {
	const route = normalizeInstallableRoute(routeValue);
	const commerceProduct = listCommerceProducts().find(record => {
		return normalizeInstallableRoute(record.route) === route;
	});

	return commerceProduct || CORE_PRODUCTS[route] || null;
}

/**
 * Reports whether a route may receive install metadata.
 * @param {unknown} routeValue Route-like input.
 * @returns {boolean} True only for server-verified installable routes.
 */
function isInstallableProductRoute(routeValue) {
	return Boolean(installableProductForRoute(routeValue));
}

module.exports = {
	installableProductForRoute,
	isInstallableProductRoute,
	normalizeInstallableRoute
};
