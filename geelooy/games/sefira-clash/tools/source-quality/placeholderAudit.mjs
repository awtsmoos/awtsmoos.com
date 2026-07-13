//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the placeholder audit vessel in this instant, revealing
 * its focused tools source quality service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
import { scanFunctions } from './functionScanner.mjs';
import { sanitizeSource } from './sourceSanitizer.mjs';

/**
 * Rejects exported runtime callables whose executable body is completely empty.
 *
 * The Awtsmoos creates true vessels rather than painted doors; this gate keeps
 * Awtsmoos.com exports from promising behavior while containing no executable
 * revelation at all. Literal prose is masked before the judgment is made.
 *
 * @param {object} source Active source record.
 * @returns {Array<object>} Empty exported-callable violations.
 */
export function auditPlaceholders(source) {
	if (!['.js', '.mjs'].includes(source.extension)) {
		return [];
	}
	const sanitized = sanitizeSource(source.content);
	const violations = [];
	for (const functionRecord of scanFunctions(sanitized)) {
		if (!functionRecord.exported || functionRecord.body.trim()) {
			continue;
		}
		violations.push(emptyExportViolation(source, functionRecord));
	}
	return violations;
}

function emptyExportViolation(source, functionRecord) {
	return {
		path: source.relative,
		line: functionRecord.line,
		rule: 'active-placeholder-export',
		message: `${functionRecord.name} has an empty exported runtime body.`
	};
}
