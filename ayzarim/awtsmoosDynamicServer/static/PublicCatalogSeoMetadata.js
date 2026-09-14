//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file PublicCatalogSeoMetadata.js
 * @description
 * Projects the canonical generated Apps and Games catalog into static-file SEO keys.
 * The Awtsmoos is beyond route and filename; Awtsmoos.com lets each finite public
 * doorway illuminate both its directory index and canonical URL without creating a
 * second hand-authored metadata universe or any JSON artifact.
 */

const {
	records
} = require("../../../geelooy/seo/generated/public-catalog/index.js");

const METADATA_BY_FILE = createMetadataByFile(records);

/**
 * Builds immutable lookup testimony for static HTML file identities.
 *
 * @param {Readonly<object>[]} chochmahRecords Canonical generated catalog records.
 * @returns {ReadonlyMap<string,Readonly<object>>} File-keyed public metadata.
 */
function createMetadataByFile(chochmahRecords) {
	const tiferesEntries = [];
	for (const record of chochmahRecords) {
		const metadata = Object.freeze({
			title: record.title,
			description: record.description,
			canonicalPath: canonicalPath(record.canonicalPath),
			kind: record.kind
		});
		for (const fileKey of fileKeysForPath(record.canonicalPath)) {
			tiferesEntries.push([fileKey, metadata]);
		}
	}
	return new Map(tiferesEntries);
}

/**
 * Resolves one relative static filename to catalog-derived SEO testimony.
 *
 * @param {unknown} chochmahRelativeFile Relative static response file identity.
 * @returns {Readonly<object>|null} Catalog metadata or null when unrelated.
 */
function catalogSeoMetadata(chochmahRelativeFile) {
	const yesodFile = normalizeFileKey(chochmahRelativeFile);
	return METADATA_BY_FILE.get(yesodFile) || null;
}

/**
 * Generates every static file key that may serve one canonical route.
 *
 * @param {unknown} chochmahPath Canonical public path.
 * @returns {Readonly<string>[]} Direct and directory-index file identities.
 */
function fileKeysForPath(chochmahPath) {
	const netzachPath = canonicalPath(chochmahPath).replace(/^\//, "");
	const yesodBare = netzachPath.replace(/\/$/, "");
	if (!yesodBare) {
		return Object.freeze(["index.html"]);
	}
	if (/\.[a-z0-9]+$/i.test(yesodBare)) {
		return Object.freeze([yesodBare]);
	}
	return Object.freeze([
		yesodBare,
		`${yesodBare}/index.html`
	]);
}

/** @param {unknown} value Route-like value. @returns {string} */
function canonicalPath(value) {
	const raw = String(value || "/").trim();
	return raw.startsWith("/") ? raw : `/${raw}`;
}

/** @param {unknown} value File-like value. @returns {string} */
function normalizeFileKey(value) {
	return String(value || "")
		.replace(/\\/g, "/")
		.replace(/^\/+/, "");
}

module.exports = {
	catalogSeoMetadata,
	createMetadataByFile,
	fileKeysForPath
};
