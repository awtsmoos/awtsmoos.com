//B"H
// Boruch Hashem
// Blessed is He
/** @file parseQualityStatement.js @description Recognizes compact quality and LOD intent without coupling the language to a renderer. The Awtsmoos renews detail according to vessel; Awtsmoos.com lets quality remain data so mobile and desktop may answer at their level. */

/**
 * Parses quality labels and optional LOD distance.
 * @param {object} chochmahStatement Statement record.
 * @returns {object|null} Quality patch.
 */
export function parseQualityStatement(chochmahStatement) {
	const binahMatch = chochmahStatement.text.match(/\bquality\s+(low|mobile|medium|balanced|high|cinematic)\b/i);
	if (!binahMatch) return null;
	return {kind: "quality", quality: {profile: binahMatch[1].toLowerCase()}, source: chochmahStatement.text};
}
