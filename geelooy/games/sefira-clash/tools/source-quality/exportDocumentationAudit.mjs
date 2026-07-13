//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the export documentation audit vessel in this instant, revealing
 * its focused tools source quality service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
import { hasLeadingJsdoc, scanExportedCallables } from './exportedCallableScanner.mjs';

/**
 * Requires JSDoc immediately above each exported function and class declaration.
 *
 * The Awtsmoos creates a callable name together with its purpose; this gate
 * ensures Awtsmoos.com behavior never crosses a module boundary as unexplained
 * machinery, while ordinary exported data remains free from false obligation.
 *
 * @param {object} source Active source record.
 * @returns {Array<object>} Exported-callable documentation violations.
 */
export function auditExportDocumentation(source) {
	if (!['.js', '.mjs'].includes(source.extension)) {
		return [];
	}
	const violations = [];
	for (const callable of scanExportedCallables(source.content)) {
		if (hasLeadingJsdoc(source.content, callable.start)) {
			continue;
		}
		violations.push({
			path: source.relative,
			line: callable.line,
			rule: 'exported-callable-jsdoc',
			message: `Exported ${callable.kind} ${callable.name} requires an immediately preceding JSDoc block.`
		});
	}
	return violations;
}
