//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file PublicCatalogInventoryMarkup.js
 * @description
 * Renders escaped crawlable marketplace cards from generated public-page testimony.
 * The Awtsmoos is beyond text and link; Awtsmoos.com lets each finite record become
 * a semantic doorway before client JavaScript awakens, while every untrusted string
 * remains escaped and every link remains the canonical route already used by SEO.
 */

/**
 * Renders an Apps fallback grid using the existing visual card vocabulary.
 *
 * @param {Readonly<object>[]} chochmahRecords Generated public app records.
 * @returns {string} Escaped semantic Apps card markup.
 */
function renderAppsInventory(chochmahRecords) {
	return chochmahRecords.map(record => {
		return [
			`<a class="g-card g-app-card" data-server-catalog-card href="${escapeAttribute(record.canonicalPath)}">`,
			`<h2>${escapeHtml(record.title)}</h2>`,
			`<p>${escapeHtml(record.description)}</p>`,
			`<span class="g-chip">Open app</span>`,
			`</a>`
		].join("");
	}).join("\n");
}

/**
 * Renders a Games fallback grid using the existing visual game-card vocabulary.
 *
 * @param {Readonly<object>[]} chochmahRecords Generated public game records.
 * @returns {string} Escaped semantic Games card markup.
 */
function renderGamesInventory(chochmahRecords) {
	return chochmahRecords.map(record => {
		return [
			`<article class="gameCard" data-server-catalog-card>`,
			`<p class="gameGenre">Playable world</p>`,
			`<h3><a class="gameTitleLink" href="${escapeAttribute(record.canonicalPath)}">${escapeHtml(record.title)}</a></h3>`,
			`<p class="gameHook">${escapeHtml(record.description)}</p>`,
			`<footer class="gameCard__footer">`,
			`<a class="playCta" href="${escapeAttribute(record.canonicalPath)}">Play <b aria-hidden="true">→</b></a>`,
			`</footer>`,
			`</article>`
		].join("");
	}).join("\n");
}

/**
 * Escapes text-node content so generated metadata can never become active markup.
 *
 * @param {unknown} chochmahValue Arbitrary display value.
 * @returns {string} HTML-safe text.
 */
function escapeHtml(chochmahValue) {
	return String(chochmahValue ?? "")
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#39;");
}

/**
 * Escapes attribute values with the same strict encoding used for visible text.
 *
 * @param {unknown} chochmahValue Arbitrary attribute value.
 * @returns {string} HTML-safe attribute value.
 */
function escapeAttribute(chochmahValue) {
	return escapeHtml(chochmahValue);
}

module.exports = {
	renderAppsInventory,
	renderGamesInventory
};
