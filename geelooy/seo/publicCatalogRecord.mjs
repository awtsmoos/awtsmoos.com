//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file publicCatalogRecord.mjs
 * @description
 * Normalizes the human-authored Apps and Games catalogs into one server-safe record
 * shape. The Awtsmoos is beyond field-name drift; Awtsmoos.com gathers each finite
 * title, description, category, route, and identity without discarding meaning that
 * has already been normalized by the browser catalog factories.
 */

/**
 * Converts one hub-relative catalog row into canonical public testimony.
 *
 * @param {object} chochmahRecord Canonical browser catalog record.
 * @param {"app"|"game"} yesodKind Marketplace source kind.
 * @param {string} netzachBasePath Hub base path used for relative URL resolution.
 * @returns {Readonly<object>} Stable generated catalog record.
 */
export function normalizePublicCatalogRecord(
	chochmahRecord,
	yesodKind,
	netzachBasePath
) {
	const tiferesUrl = new URL(
		String(chochmahRecord.href || ""),
		`https://awtsmoos.com${netzachBasePath}`
	);
	return Object.freeze({
		id: cleanText(chochmahRecord.id),
		title: cleanText(chochmahRecord.title),
		description: publicDescription(chochmahRecord),
		category: publicCategory(chochmahRecord),
		canonicalPath: tiferesUrl.pathname,
		kind: yesodKind
	});
}

/**
 * Preserves normalized browser descriptions before consulting legacy field names.
 *
 * @param {object} chochmahRecord Browser catalog record.
 * @returns {string} Human-facing product description.
 */
export function publicDescription(chochmahRecord) {
	return cleanText(
		chochmahRecord.description
		|| chochmahRecord.desc
		|| chochmahRecord.hook
	);
}

/**
 * Collapses array or scalar category testimony into one stable primary category.
 *
 * @param {object} chochmahRecord Browser catalog record.
 * @returns {string} Human-facing primary category.
 */
export function publicCategory(chochmahRecord) {
	if (Array.isArray(chochmahRecord.categories)) {
		return cleanText(chochmahRecord.categories[0]);
	}
	return cleanText(
		chochmahRecord.category
		|| chochmahRecord.genre
	);
}

/** @param {unknown} value Text-like catalog value. @returns {string} */
function cleanText(value) {
	return String(value || "").trim();
}
