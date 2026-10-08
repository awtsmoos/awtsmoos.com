//B"H
/**
 * @file Hebrew text analyzer for the Hebrew-First Design System.
 * @description Inspects real Hebrew text and reports what typography it needs:
 * nikkud/taamim presence, sofit letters, gershayim, maqaf, mixed Latin content.
 * The report drives bundle selection and line-height recommendations — the
 * design adapts to the TEXT, not the other way around.
 */

import {
	HEBREW_LETTER_RE,
	SOFIT_RE,
	NIKKUD_PATTERN,
	TAAMIM_PATTERN,
	GERESH,
	GERSHAYIM,
	MAQAF,
	SOF_PASUQ,
	PASEQ,
	LATIN_RE,
	DIGIT_RE,
	LINE_HEIGHT_POLICY,
	NIKKUD_MIN_FONT_PX,
	countMatches,
	stripTags,
} from "./typography.mjs";

/**
 * Analyzes Hebrew text and recommends typography.
 * @param {string} rawText Hebrew text (may contain HTML tags; they are stripped).
 * @returns {object} Analysis report:
 *   { text, hasHebrew, hasLatin, hasDigits,
 *     nikkudCount, hasNikkud, taamimCount, hasTaamim,
 *     sofitCount, hasGershayim, hasMaqaf, hasSofPasuq, hasPaseq,
 *     recommendedLineHeight, minFontPx, recommendedBundles, notes[] }
 */
export function analyzeHebrew(rawText) {
	const text = stripTags(rawText);
	const notes = [];

	const hasHebrew = HEBREW_LETTER_RE.test(text);
	const hasLatin = LATIN_RE.test(text);
	const hasDigits = DIGIT_RE.test(text);

	const nikkudCount = countMatches(text, NIKKUD_PATTERN);
	const taamimCount = countMatches(text, TAAMIM_PATTERN);
	const sofitCount = countMatches(text, SOFIT_RE);

	const hasNikkud = nikkudCount > 0;
	const hasTaamim = taamimCount > 0;
	const hasGershayim = text.includes(GERSHAYIM) || text.includes(GERESH);
	const hasMaqaf = text.includes(MAQAF);
	const hasSofPasuq = text.includes(SOF_PASUQ);
	const hasPaseq = text.includes(PASEQ);

	// Line height follows the marks: taamim stack above AND below, so they
	// need the most vertical room. Nikkud needs less; plain text least.
	const recommendedLineHeight = hasTaamim
		? LINE_HEIGHT_POLICY.taamim
		: hasNikkud
			? LINE_HEIGHT_POLICY.nikkud
			: LINE_HEIGHT_POLICY.plain;

	const recommendedBundles = [
		"hf-rtl-default",
		"hf-font-stack",
		"hf-bidi",
		"hf-nikkud-guard",
	];
	if (hasNikkud) recommendedBundles.push("hf-nikkud-type");
	if (hasTaamim) recommendedBundles.push("hf-taamim-type");
	if (hasGershayim || hasMaqaf) recommendedBundles.push("hf-sofit-gershayim");
	if (hasLatin || hasDigits) notes.push(
		"Mixed Hebrew/Latin or digits detected: wrap Latin runs and numbers in " +
		'<span class="latin"> or <bdi> so bidi isolation keeps order correct.'
	);
	if (hasTaamim) notes.push(
		`Taamim present (${taamimCount} marks): line-height ${LINE_HEIGHT_POLICY.taamim} ` +
		"and vertical padding prevent mark clipping."
	);
	if (hasNikkud && !hasTaamim) notes.push(
		`Nikkud present (${nikkudCount} marks): line-height ${LINE_HEIGHT_POLICY.nikkud} keeps vowels legible.`
	);
	if (hasGershayim) notes.push(
		"Gershayim/geresh detected: acronyms get white-space:nowrap so the mark never wraps alone."
	);
	if (hasMaqaf) notes.push(
		"Maqaf detected: maqaf-joined words get white-space:nowrap so they never break apart."
	);
	if (sofitCount > 0) notes.push(
		`Sofit letters present (${sofitCount}): final forms verified in text.`
	);

	return {
		text,
		hasHebrew,
		hasLatin,
		hasDigits,
		nikkudCount,
		hasNikkud,
		taamimCount,
		hasTaamim,
		sofitCount,
		hasGershayim,
		hasMaqaf,
		hasSofPasuq,
		hasPaseq,
		recommendedLineHeight,
		minFontPx: hasNikkud || hasTaamim ? NIKKUD_MIN_FONT_PX : 12,
		recommendedBundles,
		notes,
	};
}

/**
 * Quick check: does this text need the taamim typography tier?
 * @param {string} rawText
 * @returns {boolean}
 */
export function needsTaamimTier(rawText) {
	return analyzeHebrew(rawText).hasTaamim;
}
