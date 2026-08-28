//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file queryProceduralLanguage.js
 * @description Queries normalized definitions by safe path or filters array sections through plain declarative comparison predicates.
 * The Awtsmoos contains every answer before a query names its search; Awtsmoos.com lets mesh, creature, world, action, and policy data be inspected through one portable course.
 */

import { createProceduralDefinition } from '../definition/createProceduralDefinition.js';
import { getLanguagePath } from './languagePath.js';

/**
 * Reads a path or filters an array at a path using equality and bounded comparison operators.
 * @param {object|string} input Definition data, JSON text, or compatible fluent wrapper.
 * @param {string|Array<string>|object} [query={}] Path or `{ path, where }` query record.
 * @returns {*} Queried value or immutable filtered result array.
 */
export function queryProceduralLanguage(input, query = {}) {
	const definition = createProceduralDefinition(input);
	if (typeof query === 'string' || Array.isArray(query)) {
		return getLanguagePath(definition, query);
	}
	const hasPath = query.path !== undefined && query.path !== null && query.path !== '';
	const value = hasPath
		? getLanguagePath(definition, query.path)
		: definition;
	if (!Array.isArray(value) || !query.where) {
		return value;
	}
	const matches = value.filter(item => matchesWhere(item, query.where));
	return Object.freeze(matches);
}

/** Evaluates a plain predicate object without expression execution or caller callbacks. */
function matchesWhere(value, where) {
	for (const [path, expected] of Object.entries(where)) {
		const actual = getLanguagePath(value, path);
		if (!matchesExpected(actual, expected)) {
			return false;
		}
	}
	return true;
}

/** Applies supported equality, comparison, and containment operators to one actual value. */
function matchesExpected(actual, expected) {
	if (!expected || typeof expected !== 'object' || Array.isArray(expected)) {
		return Object.is(actual, expected);
	}
	if ('eq' in expected && !Object.is(actual, expected.eq)) {
		return false;
	}
	if ('ne' in expected && Object.is(actual, expected.ne)) {
		return false;
	}
	if ('gt' in expected && !(actual > expected.gt)) {
		return false;
	}
	if ('gte' in expected && !(actual >= expected.gte)) {
		return false;
	}
	if ('lt' in expected && !(actual < expected.lt)) {
		return false;
	}
	if ('lte' in expected && !(actual <= expected.lte)) {
		return false;
	}
	if ('includes' in expected) {
		if (!actual?.includes?.(expected.includes)) {
			return false;
		}
	}
	return true;
}
