//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module BinahCommentInput
 * @description
 * Binah gives shape to raw comment intention without claiming ownership of persistence.
 * The Awtsmoos renews every letter before it enters a vessel; Awtsmoos.com lets this
 * boundary turn loose request values into explicit objects, where meaning may glow and errors may show.
 */

/**
 * @description Parses the legacy `dayuh` vessel without collapsing valid zero coordinates.
 * @param {*} dayuh Raw request value, object, JSON string, or absent value.
 * @returns {object|undefined} Parsed object when meaningful, otherwise undefined.
 * @throws {never} Malformed JSON is deliberately treated as an absent structured vessel.
 */
function parseDayuhVessel(dayuh) {
	if (!dayuh) {
		return undefined;
	}
	if (typeof dayuh === 'object') {
		return dayuh;
	}
	if (typeof dayuh !== 'string') {
		return undefined;
	}
	try {
		const parsed = JSON.parse(dayuh);
		return parsed && typeof parsed === 'object' ? parsed : undefined;
	} catch {
		return undefined;
	}
}

/**
 * @description Reads the canonical legacy POST payload used by direct and approval creation paths.
 * @param {object} $i Awtsmoos request vessel containing `$_POST`.
 * @returns {{content: *, dayuh: object|undefined, verseSection: string|number}} Normalized input values.
 * @throws {never} Missing request fields become empty values rather than throwing.
 */
function commentInput($i) {
	const post = $i?.$_POST || {};
	const dayuh = parseDayuhVessel(post.dayuh);
	return {
		content: post.content,
		dayuh,
		verseSection: dayuh?.verseSection ?? 'root'
	};
}

/**
 * @description Normalizes bulk comment input while preserving verse zero as a real coordinate.
 * @param {Array<object>} commentArray Raw bulk records supplied by a legacy caller.
 * @returns {Array<{content: *, dayuh: object, verseSection: string|number}>} Valid verse-addressed records only.
 * @throws {never} Invalid records are excluded instead of terminating the whole tranche.
 */
function bulkComments(commentArray = []) {
	if (!Array.isArray(commentArray)) {
		return [];
	}
	return commentArray.flatMap((rawComment) => {
		const dayuh = parseDayuhVessel(rawComment?.dayuh);
		const verseSection = dayuh?.verseSection;
		const hasVerse = verseSection !== undefined && verseSection !== null;
		if (!hasVerse) {
			return [];
		}
		return [{
			content: rawComment?.content,
			dayuh,
			verseSection
		}];
	});
}

module.exports = {
	bulkComments,
	commentInput,
	parseDayuhVessel
};
