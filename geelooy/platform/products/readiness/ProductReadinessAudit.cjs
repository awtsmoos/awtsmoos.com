//B"H
//Boruch Hashem
//Blessed be He
/**
 * @module ProductReadinessAudit
 * @description
 * Composes filesystem, commerce, and actual served-foundation evidence into one
 * deterministic product report. Explicit nested products and automatic first-level
 * products share the same path logic instead of maintaining duplicate alias tables.
 */

const fs = require("fs");
const path = require("path");
const { revealHtmlUiFoundation } = require("../../../../ayzarim/awtsmoosDynamicServer/static/HtmlUiFoundation.js");
const {
	discoverProducts,
	supporterProductId
} = require("../../../api/wallet/core/commerce/platform/productDiscovery.js");
const { SUPPORTER_SKUS } = require("../../../api/wallet/core/commerce/supporterCatalog.js");
const { readHtmlSignalsFromSource } = require("./ProductHtmlSignals.cjs");
const { inventoryProductSource } = require("./ProductSourceInventory.cjs");
const { scoreProduct } = require("./ProductReadinessScore.cjs");

/** @param {string} repositoryRoot Canonical repository root. @returns {ReadonlyArray<object>} Ranked product evidence. */
function auditProducts(repositoryRoot = process.cwd()) {
	const results = discoverProducts().map(product => auditProduct(repositoryRoot, product));
	return Object.freeze(results.sort((left, right) => left.score - right.score || left.route.localeCompare(right.route)));
}

/** @param {string} repositoryRoot Repository root. @param {object} product Discovered product. @returns {Readonly<object>} */
function auditProduct(repositoryRoot, product) {
	const geelooyRoot = path.join(repositoryRoot, "geelooy");
	const indexFile = productIndexFile(geelooyRoot, product);
	const sourceHtml = fs.readFileSync(indexFile, "utf8");
	const servedHtml = revealHtmlUiFoundation(sourceHtml, { rootDir: geelooyRoot, filePath: indexFile });
	const html = readHtmlSignalsFromSource(servedHtml);
	const source = inventoryProductSource(path.dirname(indexFile));
	const productId = supporterProductId(product);
	const supporterTiers = SUPPORTER_SKUS.filter(sku => sku.productId === productId).length;
	const evidence = {
		html,
		source,
		commerce: { supporterTiers },
		foundationCovered: servedHtml.includes('data-awtsmoos-ui-foundation="script"')
	};
	const scored = scoreProduct(evidence);
	return Object.freeze({
		id: product.id,
		productId,
		kind: product.kind,
		route: product.route,
		title: html.title || product.title,
		...scored,
		html,
		source,
		commerce: evidence.commerce
	});
}

/** @param {string} geelooyRoot Geelooy root. @param {object} product Product record. @returns {string} Absolute index file. */
function productIndexFile(geelooyRoot, product) {
	if (product.indexPath) return path.join(geelooyRoot, product.indexPath);
	const family = product.kind === "game" ? "games" : "apps";
	return path.join(geelooyRoot, family, product.id, "index.html");
}

module.exports = { auditProducts };
