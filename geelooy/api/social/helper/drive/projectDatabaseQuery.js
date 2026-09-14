//B"H
//Boruch Hashem
//Blessed be He
/**
 * @module ProjectDatabaseQuery
 * @description
 * Executes a deliberately small visual-query vocabulary over a bounded project
 * preview. This is honest scan mode for DosDB-compatible scopes, never fake indexing.
 */

const { listProjectDocuments } = require('./projectDatabaseDocuments.js');
const OPERATORS = Object.freeze(['eq', 'ne', 'gt', 'gte', 'lt', 'lte', 'contains', 'exists']);
const FIELD_PATTERN = /^[A-Za-z0-9_$-]+(?:\.[A-Za-z0-9_$-]+){0,7}$/;

/**
 * Runs one bounded predicate and optional ascending/descending field sort.
 * @param {object} scope ProjectDatabaseScope instance.
 * @param {object} options Untrusted visual-query options.
 * @returns {Promise<object>} Matching document preview plus execution testimony.
 */
async function queryProjectDocuments(scope, options = {}) {
	const field = normalizeField(options.field);
	const operator = normalizeOperator(options.operator);
	const expected = parseQueryValue(options.value);
	const page = await listProjectDocuments(scope, { path: options.path, limit: options.limit });
	let documents = page.documents.filter(document => matches(valueAt(document.value, field), operator, expected));
	const sort = String(options.sort || '').toLowerCase();
	if (sort === 'asc' || sort === 'desc') documents = sortDocuments(documents, field, sort);
	return {
		...page,
		documents,
		matched: documents.length,
		execution: 'bounded-scan',
		query: { field, operator, value: expected, sort: sort || null }
	};
}

/** @param {unknown} value Untrusted field path. @returns {string} Safe field path. */
function normalizeField(value) {
	const field = String(value || '').trim();
	if (!FIELD_PATTERN.test(field)) throw queryError('INVALID_PROJECT_DB_QUERY_FIELD');
	return field;
}

/** @param {unknown} value Untrusted operator. @returns {string} Allowed operator. */
function normalizeOperator(value) {
	const operator = String(value || 'eq').toLowerCase();
	if (!OPERATORS.includes(operator)) throw queryError('INVALID_PROJECT_DB_QUERY_OPERATOR');
	return operator;
}

/** @param {unknown} value Query-string value. @returns {unknown} JSON value when valid, string otherwise. */
function parseQueryValue(value) {
	const source = String(value ?? '').trim();
	if (!source) return '';
	try { return JSON.parse(source); } catch { return source; }
}

/** @param {unknown} value Candidate. @param {string} operator Operator. @param {unknown} expected Expected value. @returns {boolean} */
function matches(value, operator, expected) {
	if (operator === 'exists') return Boolean(expected) ? value !== undefined : value === undefined;
	if (operator === 'contains') return Array.isArray(value) ? value.includes(expected) : String(value ?? '').includes(String(expected));
	if (operator === 'eq') return Object.is(value, expected);
	if (operator === 'ne') return !Object.is(value, expected);
	if (operator === 'gt') return value > expected;
	if (operator === 'gte') return value >= expected;
	if (operator === 'lt') return value < expected;
	return value <= expected;
}

/** @param {unknown} value Document value. @param {string} field Dot path. @returns {unknown} Nested value. */
function valueAt(value, field) {
	return field.split('.').reduce((current, part) => current == null ? undefined : current[part], value);
}

/** @param {Array<object>} documents Documents. @param {string} field Sort field. @param {string} direction Direction. @returns {Array<object>} */
function sortDocuments(documents, field, direction) {
	const sign = direction === 'desc' ? -1 : 1;
	return [...documents].sort((left, right) => compare(valueAt(left.value, field), valueAt(right.value, field)) * sign);
}

/** @param {unknown} left Left value. @param {unknown} right Right value. @returns {number} Stable comparison. */
function compare(left, right) {
	if (Object.is(left, right)) return 0;
	if (left === undefined || left === null) return 1;
	if (right === undefined || right === null) return -1;
	return left < right ? -1 : 1;
}

/** @param {string} code Stable failure code. @returns {Error} HTTP-aware query failure. */
function queryError(code) {
	const error = new Error(code);
	error.code = code;
	error.statusCode = 400;
	return error;
}

module.exports = { FIELD_PATTERN, OPERATORS, normalizeField, normalizeOperator, parseQueryValue, queryProjectDocuments };
