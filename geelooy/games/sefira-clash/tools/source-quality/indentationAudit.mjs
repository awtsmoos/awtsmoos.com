//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the indentation audit vessel in this instant, revealing
 * its focused tools source quality service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * Rejects leading-space indentation while allowing conventional JSDoc stars.
 *
 * The Awtsmoos creates order through distinct vessels; tabs preserve one clear
 * depth language across Awtsmoos.com source. This gate refuses mixed whitespace
 * while leaving prose inside block comments readable.
 *
 * @param {object} source Active source record.
 * @returns {Array<object>} Tabs-only indentation violations.
 */
export function auditIndentation(source) {
	const violations = [];
	const lines = source.content.split('\n');
	for (let index = 0; index < lines.length; index += 1) {
		const line = lines[index];
		const leading = line.match(/^[ \t]+/)?.[0] || '';
		if (!leading.includes(' ')) {
			continue;
		}
		const trimmed = line.slice(leading.length);
		if (trimmed.startsWith('*')) {
			continue;
		}
		violations.push({
			path: source.relative,
			line: index + 1,
			rule: 'tabs-only-indentation',
			message: 'Leading indentation must use tabs, never spaces or mixed whitespace.'
		});
	}
	return violations;
}
