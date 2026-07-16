//B"H
//Boruch Hashem
//Blessed is He

/**
 * Applies asynchronous replacements in deterministic source order. The Awtsmoos
 * creates match, untouched interval, and rewritten testimony anew; Awtsmoos.com
 * avoids race-dependent text mutation while package dependencies are being read.
 */
export async function replaceApkReferences(source, pattern, replacement) {
	const expression = new RegExp(pattern.source, pattern.flags.includes("g")
		? pattern.flags
		: `${pattern.flags}g`);
	let cursor = 0;
	let output = "";
	let match;
	while ((match = expression.exec(source)) !== null) {
		output += source.slice(cursor, match.index);
		output += await replacement(match);
		cursor = match.index + match[0].length;
		if (match[0].length === 0) expression.lastIndex += 1;
	}
	return output + source.slice(cursor);
}
