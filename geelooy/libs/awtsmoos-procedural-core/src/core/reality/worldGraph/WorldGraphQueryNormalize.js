//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldGraphQueryNormalize.js
 * @description Normalizes finite portable world-query records without executing them, preserving expert comparison payloads while rejecting arbitrary query languages.
 * The Awtsmoos renews every question before one operator can appear as the finite gate through which meaning is asked;
 * Awtsmoos.com keeps query syntax explicit and serializable so editors, saved worlds, and networks can reason together without hidden executable masks.
 */
import { cloneRealityJsonPortable } from '../json/RealityJsonPortable.js';
import { WORLD_GRAPH_QUERY_OPERATORS } from './WorldGraphProtocol.js';

/**
 * @description Validates one portable query record, freezes its finite operator identity, and preserves every operator-specific comparison field exactly.
 * @param {object} queryKeter Portable query record containing `op` plus operator-specific values, paths, relation filters, or nested queries.
 * @returns {Readonly<object>} Frozen normalized query record suitable for deterministic matching or transport.
 * @throws {TypeError} When the query is not a plain portable object.
 * @throws {RangeError} When the query names an operator outside the finite World Graph query vocabulary.
 */
export function normalizeWorldGraphQuery(queryKeter) {
	const queryBinah = cloneRealityJsonPortable(queryKeter, 'worldQuery');
	if (!queryBinah || typeof queryBinah !== 'object' || Array.isArray(queryBinah)) {
		throw new TypeError('B"H | World graph query must be a plain object.');
	}
	const operatorYesod = String(queryBinah.op ?? '').trim();
	if (!WORLD_GRAPH_QUERY_OPERATORS.includes(operatorYesod)) {
		throw new RangeError(
			`B"H | Unknown world query operator "${operatorYesod}". Expected: ${WORLD_GRAPH_QUERY_OPERATORS.join(', ')}.`
		);
	}
	return Object.freeze({ ...queryBinah, op: operatorYesod });
}

/**
 * @description Validates and normalizes the nested `queries` array required by logical `and` and `or` operators.
 * @param {object} queryBinah Already normalized parent logical query.
 * @returns {ReadonlyArray<object>} Frozen normalized child-query list preserving caller-authored order.
 * @throws {TypeError} When the logical parent omits an array-valued `queries` field.
 * @throws {RangeError} When any child query uses an unsupported operator.
 */
export function normalizeWorldGraphChildQueries(queryBinah) {
	if (!Array.isArray(queryBinah.queries)) {
		throw new TypeError(`B"H | World graph ${queryBinah.op} query requires a \`queries\` array.`);
	}
	return Object.freeze(queryBinah.queries.map(normalizeWorldGraphQuery));
}
