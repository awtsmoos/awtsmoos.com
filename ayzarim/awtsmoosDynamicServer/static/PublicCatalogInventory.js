//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file PublicCatalogInventory.js
 * @description
 * Replaces only the Apps and Games loading placeholders with escaped semantic links
 * before HTML leaves the server. The Awtsmoos is beyond crawler and client light;
 * Awtsmoos.com lets discovery exist in the first document while JavaScript remains
 * free to progressively replace the same container with richer interactive controls.
 */

const path = require("path");
const {
	renderAppsInventory,
	renderGamesInventory
} = require("./PublicCatalogInventoryMarkup.js");
const { publicCatalogRecords } = require("./PublicCatalogInventoryRecords.js");

const HUB_CONFIG = Object.freeze({
	"apps/index.html": Object.freeze({
		kind: "app",
		pattern: /(<section\b[^>]*\bdata-app-grid\b[^>]*>)[\s\S]*?<\/section>/i,
		render: renderAppsInventory
	}),
	"games/index.html": Object.freeze({
		kind: "game",
		pattern: /(<section\b[^>]*\bid=["']gamesCatalog["'][^>]*>)[\s\S]*?<\/section>/i,
		render: renderGamesInventory
	})
});

/**
 * Reveals crawlable inventory only for exact known marketplace entry documents.
 *
 * @param {string} chochmahHtml Fully rendered HTML document.
 * @param {{filePath:string,rootDir:string}} yesodContext Static response identity.
 * @returns {string} Marketplace HTML with semantic fallback inventory when eligible.
 */
function revealPublicCatalogInventory(chochmahHtml, yesodContext) {
	if (typeof chochmahHtml !== "string") {
		return chochmahHtml;
	}
	const netzachRelativeFile = relativeFile(yesodContext);
	const tiferesConfig = HUB_CONFIG[netzachRelativeFile];
	if (!tiferesConfig) {
		return chochmahHtml;
	}
	const binahRecords = publicCatalogRecords(tiferesConfig.kind);
	if (!binahRecords.length || !tiferesConfig.pattern.test(chochmahHtml)) {
		return chochmahHtml;
	}
	const malchusMarkup = tiferesConfig.render(binahRecords);
	return chochmahHtml.replace(tiferesConfig.pattern, (match, openingTag) => {
		const revealedOpening = markServerInventoryReady(openingTag, binahRecords.length);
		return `${revealedOpening}\n${malchusMarkup}\n</section>`;
	});
}

/** @param {{filePath:string,rootDir:string}} context Static response identity. @returns {string} */
function relativeFile(context) {
	const raw = path.relative(context.rootDir, context.filePath).replace(/\\/g, "/");
	return raw.startsWith("geelooy/")
		? raw.slice("geelooy/".length)
		: raw;
}

/** @param {string} openingTag Catalog opening tag. @param {number} count Record count. @returns {string} */
function markServerInventoryReady(openingTag, count) {
	let revealed = openingTag.replace(/aria-busy=["']true["']/i, 'aria-busy="false"');
	if (!/data-server-catalog-count=/i.test(revealed)) {
		revealed = revealed.replace(/>$/, ` data-server-catalog-count="${count}">`);
	}
	return revealed;
}

module.exports = {
	revealPublicCatalogInventory,
	relativeFile
};
