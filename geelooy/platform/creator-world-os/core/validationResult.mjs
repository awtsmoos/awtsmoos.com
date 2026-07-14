// B"H
// Boruch Hashem
// Blessed is He
/** @module ValidationResult @description Returns path-aware validation without hidden exceptions. */

/** Creates a successful validation result. */
export function validationSuccess(value, warnings = []) {
	return Object.freeze({
		ok: true,
		value,
		warnings: Object.freeze(normalizeIssues(warnings)),
		errors: Object.freeze([])
	});
}

/** Creates a failed validation result. */
export function validationFailure(errors, warnings = []) {
	const normalizedErrors = normalizeIssues(errors);
	if (!normalizedErrors.length) {
		throw new TypeError('Validation failure requires at least one error.');
	}
	return Object.freeze({
		ok: false,
		value: null,
		warnings: Object.freeze(normalizeIssues(warnings)),
		errors: Object.freeze(normalizedErrors)
	});
}

/** Creates one path-aware issue. */
export function validationIssue(path, message, code = 'invalid') {
	return Object.freeze({
		path: String(path || '$'),
		message: String(message || 'Invalid value.'),
		code: String(code || 'invalid')
	});
}

function normalizeIssues(issues) {
	return [...issues].map(issue => {
		return typeof issue === 'string' ? validationIssue('$', issue) : Object.freeze({ ...issue });
	});
}
