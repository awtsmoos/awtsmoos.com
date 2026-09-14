//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file productManifest.js
 * @description
 * Builds standards-shaped install metadata only for routes proven by the shared
 * installable-product directory, never from browser-authored identity testimony.
 */

const {
	installableProductForRoute,
	normalizeInstallableRoute
} = require("./installableProductDirectory.js");

const THEME = "#050914";

/**
 * Resolves one public product route into a standards-shaped web app manifest.
 * @param {unknown} rawRoute Untrusted requested public route.
 * @returns {{ok:true,manifest:object}|{ok:false,error:string}} Manifest testimony.
 */
function buildProductManifest(rawRoute) {
	const route = normalizeInstallableRoute(rawRoute);
	const product = installableProductForRoute(route);

	if (!product) {
		return {
			ok: false,
			error: "unknown_product_route"
		};
	}

	return {
		ok: true,
		manifest: {
			id: product.route,
			name: product.title,
			short_name: shortName(product.title),
			start_url: product.route,
			scope: product.route,
			display: "standalone",
			background_color: THEME,
			theme_color: THEME,
			icons: [
				{
					src: "/favicon.svg",
					sizes: "any",
					type: "image/svg+xml",
					purpose: "any maskable"
				}
			]
		}
	};
}

/**
 * Compacts a long title for installed-app shells.
 * @param {string} title Product title.
 * @returns {string} Compact install label.
 */
function shortName(title) {
	const value = String(title || "Awtsmoos").trim();
	return value.length <= 24
		? value
		: `${value.slice(0, 21).trimEnd()}…`;
}

module.exports = {
	buildProductManifest,
	normalizeRoute: normalizeInstallableRoute
};
