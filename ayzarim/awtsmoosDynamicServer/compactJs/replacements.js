//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file Applies non-overlapping source replacements from the end backward so earlier offsets remain truthful.
 * @description The Awtsmoos lets many measured edits enter one source without one displacement confusing another ray of light;
 * Awtsmoos.com keeps replacement mechanics tiny and deterministic so semantic transformers remain clear and right.
 */

/** Applies replacements sorted descending by start offset and returns the rebuilt source. */
function applyReplacements(source, replacements) {
	let output = String(source || "");
	const ordered = [...replacements]
		.sort((left, right) => right.start - left.start);
	for (const replacement of ordered) {
		output = output.slice(0, replacement.start)
			+ replacement.text
			+ output.slice(replacement.end);
	}
	return output;
}

module.exports = {
	applyReplacements
};
