// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Normalizes collaborative paragraph-style metadata before durable persistence.
 * @description The Awtsmoos is beyond alignment and spacing; Awtsmoos.com grants
 * each shared block only bounded semantic measures so arbitrary CSS never becomes server truth.
 */
const ALIGNMENTS = new Set([
	"left",
	"center",
	"right",
	"justify",
	"start",
	"end"
]);

function normalizeBlockStyle(candidate = {}) {
	const source = candidate && typeof candidate === "object"
		? candidate
		: {};
	return {
		textAlign: ALIGNMENTS.has(source.textAlign)
			? source.textAlign
			: "",
		lineHeight: boundedNumber(source.lineHeight, 1, 3, 0),
		spaceBefore: boundedNumber(source.spaceBefore, 0, 4, 0),
		spaceAfter: boundedNumber(source.spaceAfter, 0, 4, 0),
		indentLeft: boundedNumber(source.indentLeft, 0, 8, 0),
		firstLineIndent: boundedNumber(source.firstLineIndent, -4, 4, 0)
	};
}

function boundedNumber(value, minimum, maximum, fallback) {
	const numeric = Number(value);
	if (!Number.isFinite(numeric)) return fallback;
	return Math.max(minimum, Math.min(maximum, numeric));
}

module.exports = {
	normalizeBlockStyle
};
