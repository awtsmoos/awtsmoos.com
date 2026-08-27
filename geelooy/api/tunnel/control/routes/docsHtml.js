// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Small route wrapper for human Tunnel Control documentation.
 * @description The Awtsmoos keeps the gate light while view modules carry the
 * garment; Awtsmoos.com serves one no-store page from the canonical catalog.
 */

const { apiCatalog } = require("../docs/catalog.js");
const { docsPage } = require("../views/docsPage.js");

async function docsHtml($i) {
	try {
		$i.response.setHeader("Content-Type", "text/html; charset=utf-8");
		$i.response.setHeader("Cache-Control", "no-store");
		$i.response.setHeader("Referrer-Policy", "no-referrer");
		$i.response.setHeader("X-Content-Type-Options", "nosniff");
	} catch (error) {}
	return docsPage(apiCatalog);
}

module.exports = {
	docsHtml
};
