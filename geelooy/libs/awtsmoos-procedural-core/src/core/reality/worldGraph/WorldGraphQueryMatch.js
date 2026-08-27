//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldGraphQueryMatch.js
 * @description Evaluates normalized finite query records against canonical world nodes while delegating path criteria and nested-query normalization to focused helpers.
 * The Awtsmoos renews every question and every possible answer before a finite predicate can return true or false;
 * Awtsmoos.com lets query matching remain deterministic and portable while experts can still inspect arbitrary deep options through explicit paths.
 */
import {
	normalizeWorldGraphChildQueries,
	normalizeWorldGraphQuery
} from './WorldGraphQueryNormalize.js';
import {
	matchesWorldGraphCriteria,
	worldGraphValueAtPath
} from './WorldGraphQueryValue.js';

/**
 * @description Tests one canonical world node against one normalized or graph-like query record, including logical composition, deep-path criteria, and relationship filters.
 * @param {object} nodeKli Canonical world node to test.
 * @param {object} queryKeter Normalized or graph-like portable query record.
 * @returns {boolean} True when the node satisfies the complete finite query expression.
 * @throws {TypeError|RangeError} When nested query structure, path criteria, or query operator data is invalid.
 */
export function matchesWorldGraphQuery(nodeKli, queryKeter) {
	const queryBinah = normalizeWorldGraphQuery(queryKeter);
	if (queryBinah.op === 'id') return nodeKli.id === String(queryBinah.value ?? '');
	if (queryBinah.op === 'type') return nodeKli.type === String(queryBinah.value ?? '');
	if (queryBinah.op === 'domain') return nodeKli.domain === String(queryBinah.value ?? '');
	if (queryBinah.op === 'path') return matchesPathQuery(nodeKli, queryBinah);
	if (queryBinah.op === 'relationship') return matchesRelationshipQuery(nodeKli, queryBinah);
	if (queryBinah.op === 'and') {
		return normalizeWorldGraphChildQueries(queryBinah).every((childBinah) => {
			return matchesWorldGraphQuery(nodeKli, childBinah);
		});
	}
	if (queryBinah.op === 'or') {
		return normalizeWorldGraphChildQueries(queryBinah).some((childBinah) => {
			return matchesWorldGraphQuery(nodeKli, childBinah);
		});
	}
	if (queryBinah.op === 'not') return !matchesWorldGraphQuery(nodeKli, queryBinah.query);
	return false;
}

/**
 * @description Matches an arbitrary deep node path against finite equality, containment, and numeric-range criteria without evaluating executable expressions.
 * @param {object} nodeKli Canonical world node to inspect.
 * @param {object} queryBinah Normalized `path` query containing a non-empty path and optional comparison criteria.
 * @returns {boolean} True when the resolved deep value satisfies every declared criterion.
 * @throws {TypeError} When the path is empty or numeric criteria target a non-finite value.
 */
function matchesPathQuery(nodeKli, queryBinah) {
	const pathYesod = String(queryBinah.path ?? '').trim();
	if (!pathYesod) throw new TypeError('B"H | World graph path query requires `path`.');
	return matchesWorldGraphCriteria(worldGraphValueAtPath(nodeKli, pathYesod), queryBinah);
}

/**
 * @description Matches canonical relationship edges by optional exact kind and target filters while preserving expert edge options as non-filtered data unless queried through a path.
 * @param {object} nodeKli Canonical world node whose edge list is inspected.
 * @param {object} queryBinah Normalized `relationship` query with optional `kind` and `target` filters.
 * @returns {boolean} True when at least one canonical edge satisfies every supplied relation filter.
 */
function matchesRelationshipQuery(nodeKli, queryBinah) {
	return nodeKli.relationships.some((relationshipNetzach) => {
		const kindMatches = queryBinah.kind == null || relationshipNetzach.kind === String(queryBinah.kind);
		const targetMatches = queryBinah.target == null || relationshipNetzach.target === queryBinah.target;
		return kindMatches && targetMatches;
	});
}
