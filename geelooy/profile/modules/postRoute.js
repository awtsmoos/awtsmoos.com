//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module ProfilePostRoute
 * @description Derives a post's own reader route from the record itself.
 * A post lives inside one Heichel and one series; the reader route is
 * built from those coordinates, never from a fixed Heichel. Records
 * that carry an explicit url keep it — it outranks derivation.
 */

/**
 * Builds the canonical reader path for a post-shaped record.
 * Accepts the field spellings the profile endpoints actually emit
 * (heichelId/heichel, seriesId/series, postId/id). Returns "" when
 * the record does not identify a post at all.
 */
export function postRouteFor(record = {}) {
	const explicit = String(record.url || "").trim();
	if (explicit) return explicit;
	const postId = String(record.postId || record.id || "").trim();
	if (!postId) return "";
	const heichelId = String(record.heichelId || record.heichel || "").trim();
	if (!heichelId) return "";
	const seriesId = String(record.seriesId || record.series || "root").trim() || "root";
	return "/heichelos/" + encodeURIComponent(heichelId)
		+ "/series/" + encodeURIComponent(seriesId)
		+ "/post/" + encodeURIComponent(postId);
}
