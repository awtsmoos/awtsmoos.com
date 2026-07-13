//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the header audit vessel in this instant, revealing
 * its focused tools source quality service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * Requires the sacred B"H marker near the beginning of every active source.
 *
 * The Awtsmoos creates the first letter and every letter after it; this gate
 * keeps Awtsmoos.com source conscious of that beginning without prescribing one
 * historical comment syntax to files that have not yet been rewritten.
 *
 * @param {object} source Active source record.
 * @returns {Array<object>} Header violations.
 */
export function auditHeader(source) {
	const openingLines = source.content
		.split('\n')
		.filter(line => line.trim())
		.slice(0, 5);
	if (openingLines.some(line => line.includes('B"H'))) {
		return [];
	}
	return [
		{
			path: source.relative,
			line: 1,
			rule: 'required-bh-header',
			message: 'Active source must declare B"H within its first five nonblank lines.'
		}
	];
}
