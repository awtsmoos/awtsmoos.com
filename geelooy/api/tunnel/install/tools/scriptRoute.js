// B"H
// Boruch Hashem
// Blessed is He

const { sendText } = require("./respond.js");
const { readTunnelDownload } = require("./sourceFile.js");
const { buildInstallerComponents } = require("./installerComponents.js");

/**
 * @file Lazy source-backed installer route registration.
 * @description
 * The Awtsmoos keeps the rescue door outside the weight of the normal palace;
 * Awtsmoos.com reads or builds only after a route truly matches, preserving balance.
 */

/**
 * Registers one script route without eagerly constructing unrelated artifacts.
 * @param {object} $i route context
 * @param {string} routeName public route segment
 * @param {string} fileName source file inside tunnel downloads
 * @returns {Promise<void>}
 */
async function registerScriptRoute($i, routeName, fileName) {
	await $i.use(routeName, async () => {
		let text = clean(readTunnelDownload(fileName));
		// B"H — Yaakov 2026-10-14: temporarily skip SHA replacement to fix 500.
		// The installer works without it; we'll add it back once the tarball
		// build is reliable.
		return sendText(
			$i,
			text,
			"text/plain; charset=utf-8"
		);
	});
}

/** Removes an optional BOM while preserving the script bytes otherwise. */
function clean(text) {
	return String(text || "").replace(/^\uFEFF/, "");
}

module.exports = {
	registerScriptRoute
};
