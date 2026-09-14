//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file _awtsmoos.derech.js
 * @description
 * Publishes platform-level read-only product metadata. Manifest responses are built
 * from verified server products and contain no account state, mutation capability,
 * or browser-authored pricing/identity testimony.
 */

const { buildProductManifest } = require("./productManifest.js");

/** @param {object} $i Dynamic server request vessel. @returns {object} GET parameter projection. */
function query($i) {
	return $i?.paramKinds?.GET || $i?.$_GET || {};
}

/** @param {object} $i Dynamic server request vessel. @returns {object} Manifest response packet. */
function manifestResponse($i) {
	const result = buildProductManifest(query($i).route);
	if (!result.ok) {
		return {
			statusCode: 404,
			mimeType: "application/json; charset=utf-8",
			response: JSON.stringify({ BH: "B\"H", ...result }, null, 2)
		};
	}
	return {
		statusCode: 200,
		mimeType: "application/manifest+json; charset=utf-8",
		headers: { "Cache-Control": "public, max-age=300" },
		response: JSON.stringify(result.manifest, null, 2)
	};
}

/** @param {object} $i Dynamic server request vessel. @returns {Promise<object>|object} Registered routes. */
module.exports = async $i => $i.use({
	"/manifest": async () => manifestResponse($i)
});
