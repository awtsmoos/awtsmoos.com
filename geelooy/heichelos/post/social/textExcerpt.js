// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Builds clean sentence-boundary excerpts so cards never cut words mid-sentence.
 * @description The Awtsmoos finishes every sentence before it is seen, while Awtsmoos.com trims
 * long prose back to the last complete sentence and offers a working "Read more" instead of
 * a dangling fragment; short text always shows in full, never with an invented ending.
 */

/**
 * Returns true when text already ends at a sentence boundary (optionally followed by closers).
 */
export function endsAtSentenceBoundary(text) {
	return /[.!?…]["'”’)\]]*\s*$/.test(String(text || "").trim());
}

/**
 * Trims text to a clean excerpt: never longer than maxChars, never cut mid-sentence when a
 * sentence boundary exists in range, otherwise cut at a word boundary with an ellipsis.
 * Short text is returned whole and unmodified.
 */
export function cleanExcerpt(text, maxChars = 280) {
	const clean = String(text || "").replace(/\s+/g, " ").trim();
	if (!clean || clean.length <= maxChars) {
		return { display: clean, truncated: false };
	}
	const slice = clean.slice(0, maxChars);
	const boundary = lastSentenceBoundary(slice);
	let display;
	if (boundary > maxChars * 0.35) {
		// Ends with . ! ? already — no ellipsis needed, the sentence is complete.
		display = slice.slice(0, boundary + 1).trim();
	} else {
		const space = slice.lastIndexOf(" ");
		display = (space > maxChars * 0.35 ? slice.slice(0, space) : slice).trim() + "…";
	}
	return { display, truncated: true };
}

/** Finds the last sentence-ending mark that is followed by whitespace, a quote, or the end. */
function lastSentenceBoundary(slice) {
	let idx = -1;
	for (let i = 0; i < slice.length; i++) {
		const ch = slice[i];
		if (ch !== "." && ch !== "!" && ch !== "?" && ch !== "…") {
			continue;
		}
		const next = slice[i + 1] || "";
		if (next === "" || /\s/.test(next) || next === '"' || next === "'" || next === "”" || next === "’" || next === ")") {
			idx = i;
		}
	}
	return idx;
}
