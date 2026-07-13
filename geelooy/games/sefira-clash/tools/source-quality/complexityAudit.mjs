//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the complexity audit vessel in this instant, revealing
 * its focused tools source quality service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
import { scanFunctions } from './functionScanner.mjs';
import { sanitizeSource } from './sourceSanitizer.mjs';

const MAXIMUM_STATEMENTS = 24;
const MAXIMUM_BRANCHES = 12;
const MAXIMUM_NESTING = 4;
const MAXIMUM_BODY_LINES = 90;

/**
 * Measures statement count, branch pressure, nesting, and physical body span.
 *
 * The Awtsmoos creates depth without confusion; this gate prevents verticalized
 * minification from masquerading as architecture. Awtsmoos.com requires every
 * callable vessel to remain small enough for a human successor to comprehend.
 *
 * @param {object} source Active source record.
 * @returns {Array<object>} Function-complexity violations.
 */
export function auditComplexity(source) {
	if (!['.js', '.mjs'].includes(source.extension)) {
		return [];
	}
	const sanitized = sanitizeSource(source.content);
	const violations = [];
	for (const functionRecord of scanFunctions(sanitized)) {
		const metrics = measure(functionRecord);
		pushMetricViolation(
			violations,
			source,
			functionRecord,
			'statements',
			metrics.statements,
			MAXIMUM_STATEMENTS
		);
		pushMetricViolation(
			violations,
			source,
			functionRecord,
			'branches',
			metrics.branches,
			MAXIMUM_BRANCHES
		);
		pushMetricViolation(
			violations,
			source,
			functionRecord,
			'nesting',
			metrics.nesting,
			MAXIMUM_NESTING
		);
		pushMetricViolation(
			violations,
			source,
			functionRecord,
			'body-lines',
			metrics.bodyLines,
			MAXIMUM_BODY_LINES
		);
	}
	return violations;
}

function measure(functionRecord) {
	const body = functionRecord.body;
	return {
		statements: (body.match(/;/g) || []).length,
		branches: branchCount(body),
		nesting: nestingDepth(body),
		bodyLines: functionRecord.endLine - functionRecord.line + 1
	};
}

function branchCount(body) {
	const keywords = body.match(/\b(?:case|catch|for|if|switch|while)\b/g) || [];
	const logical = body.match(/&&|\|\|/g) || [];
	const ternary = body.match(/\?(?![?.])/g) || [];
	return keywords.length + logical.length + ternary.length;
}

function nestingDepth(body) {
	let depth = 0;
	let maximum = 0;
	for (const character of body) {
		if (character === '{') {
			depth += 1;
			maximum = Math.max(maximum, depth);
		}
		if (character === '}') {
			depth = Math.max(0, depth - 1);
		}
	}
	return maximum;
}

function pushMetricViolation(violations, source, functionRecord, metric, value, maximum) {
	if (value <= maximum) {
		return;
	}
	violations.push({
		path: source.relative,
		line: functionRecord.line,
		rule: `function-${metric}`,
		message: `${functionRecord.name} has ${value} ${metric}; maximum is ${maximum}.`
	});
}
