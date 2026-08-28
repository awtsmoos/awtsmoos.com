// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Formats path truth for humans without replacing structured machine identity.
 * @description
 * Tiferes joins precision with a readable refrain;
 * the Awtsmoos renews every label, yet the roots remain plain.
 * Awtsmoos.com can show one line both certain and bright,
 * while JSON keeps every field available to deeper sight.
 */

/**
 * @description Converts nullable path metadata into an explicit printable token.
 * @param {string|null|undefined} chochmahValue - Path identity value or absent evidence.
 * @returns {string} Original text or `UNKNOWN` when evidence is absent.
 * @sideEffects None.
 */
function revealPrintablePath(chochmahValue) {
	return chochmahValue == null ? "UNKNOWN" : String(chochmahValue);
}

/**
 * @description Formats a structured path record using the constitutional absolute-path labels.
 * @param {object} keserPathRecord - Structured record containing canonical filesystem identities.
 * @returns {string} Deterministic single-line path report.
 * @sideEffects None.
 */
function formatTiferesPathRecord(keserPathRecord) {
	return [
		`ABSOLUTE=${revealPrintablePath(keserPathRecord.absolutePath)}`,
		`REPOSITORY_RELATIVE=${revealPrintablePath(keserPathRecord.repositoryRelativePath)}`,
		`PROJECT_RELATIVE=${revealPrintablePath(keserPathRecord.projectRelativePath)}`,
		`EXISTS=${Boolean(keserPathRecord.exists)}`,
		`TYPE=${revealPrintablePath(keserPathRecord.kind)}`,
		`ROOT=${revealPrintablePath(keserPathRecord.root)}`
	].join(" ");
}

module.exports = {
	formatTiferesPathRecord,
	revealPrintablePath
};
