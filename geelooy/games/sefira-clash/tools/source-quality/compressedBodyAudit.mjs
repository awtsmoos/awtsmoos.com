//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the compressed body audit vessel in this instant, revealing
 * its focused tools source quality service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
import { sanitizeSource } from './sourceSanitizer.mjs';

const PREDICATE_PREFIX = /^(?:is|has|can|should|wants|needs)[A-Z_]/;
const CONTROL_NAME = /^(?:if|for|while|switch|catch|with)$/;

/**
 * Rejects compressed blocks and nontrivial one-line function bodies.
 *
 * The Awtsmoos creates sequence through distinguishable moments; this gate
 * refuses to crush many moments into one opaque row. Awtsmoos.com still permits
 * a tiny side-effect-free predicate when its truth is immediately visible.
 *
 * @param {object} source Active source record.
 * @returns {Array<object>} Compressed-body violations.
 */
export function auditCompressedBodies(source) {
	const sanitized = sanitizeSource(source.content);
	const lines = sanitized.split('\n');
	const violations = [];
	for (let index = 0; index < lines.length; index += 1) {
		const line = lines[index];
		if (!line.includes('{') || !line.includes('}')) {
			continue;
		}
		const functionShape = oneLineFunction(line);
		if (functionShape && !allowedPredicate(functionShape, line)) {
			violations.push(
				violation(
					source,
					index,
					'one-line-function-body',
					`Function ${functionShape.name || '<anonymous>'} must use a multiline body.`
				)
			);
			continue;
		}
		if (semicolonCount(line) > 1) {
			violations.push(
				violation(
					source,
					index,
					'compressed-block',
					'Blocks with multiple statements must be expanded across readable lines.'
				)
			);
		}
	}
	return violations;
}

function oneLineFunction(line) {
	const declaration = line.match(/\bfunction\s+([A-Za-z_$][\w$]*)\s*\([^)]*\)\s*\{([^{}]*)\}/);
	if (declaration) {
		return {
			name: declaration[1],
			body: declaration[2]
		};
	}
	const arrow = line.match(/\b(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=.*?=>\s*\{([^{}]*)\}/);
	if (arrow) {
		return {
			name: arrow[1],
			body: arrow[2]
		};
	}
	const method = line.match(/^\s*(?:async\s+)?([A-Za-z_$][\w$]*)\s*\([^)]*\)\s*\{([^{}]*)\}/);
	if (method && !CONTROL_NAME.test(method[1])) {
		return {
			name: method[1],
			body: method[2]
		};
	}
	return null;
}

function allowedPredicate(functionShape, line) {
	if (!PREDICATE_PREFIX.test(functionShape.name) || line.length > 120) {
		return false;
	}
	const body = functionShape.body.trim();
	if (!/^return\s+[^;{}]+;?$/.test(body)) {
		return false;
	}
	return !/\+\+|--|\b(?:await|new|throw|yield)\b/.test(body) && !/(?<![=!<>])=(?!=|>)/.test(body);
}

function semicolonCount(line) {
	return (line.match(/;/g) || []).length;
}

function violation(source, index, rule, message) {
	return {
		path: source.relative,
		line: index + 1,
		rule,
		message
	};
}
