// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module PortalQueryDefinition
 * @description
 * The Awtsmoos allows boundless questions while every finite backend still needs a measured gate;
 * Awtsmoos.com normalizes filters, sorting, projection, and cursors so discovery remains expressive without becoming unbounded weight.
 */

const {
	normalizePortalRecord,
	requireMachineId,
	requirePortalString
} = require("./PortalContractPrimitives.js");
const {
	PORTAL_CONTRACT_LIMITS,
	clampPortalInteger
} = require("./PortalContractLimits.js");

/**
 * @description Normalizes one filter clause while preserving only declarative data and explicit operators.
 * @param {Object} filter - Candidate query filter.
 * @returns {Object} Stable filter clause.
 * @throws {TypeError} When field or operator identifiers are malformed.
 */
function normalizePortalFilter(filter) {
	const source = normalizePortalRecord(filter, "query filter");
	return {
		field: requirePortalString(source.field, "query filter field", 256),
		operator: requireMachineId(source.operator ?? "eq", "query filter operator"),
		value: source.value ?? null
	};
}

/**
 * @description Normalizes a bounded Portal query request into deterministic declarative data.
 * @param {Object} [source={}] - Candidate query request.
 * @returns {Object} Stable query descriptor.
 * @throws {TypeError} When filter or sort metadata is malformed.
 */
function normalizePortalQuery(source = {}) {
	const query = normalizePortalRecord(source, "query");
	const filters = Array.isArray(query.filters)
		? query.filters.slice(0, PORTAL_CONTRACT_LIMITS.maxQueryFilters).map(normalizePortalFilter)
		: [];
	const sort = Array.isArray(query.sort)
		? query.sort.slice(0, 16).map((entry) => {
			const item = normalizePortalRecord(entry, "query sort entry");
			return {
				field: requirePortalString(item.field, "query sort field", 256),
				direction: item.direction === "desc" ? "desc" : "asc"
			};
		})
		: [];

	return {
		text: typeof query.text === "string" ? query.text.trim().slice(0, 2048) : "",
		filters,
		sort,
		projection: Array.isArray(query.projection) ? query.projection.slice(0, 64) : [],
		cursor: query.cursor == null ? null : requirePortalString(query.cursor, "query cursor", 2048),
		limit: clampPortalInteger(query.limit, 1, PORTAL_CONTRACT_LIMITS.maxQueryPageSize, 50),
		meta: normalizePortalRecord(query.meta, "query meta")
	};
}

module.exports = {
	normalizePortalFilter,
	normalizePortalQuery
};
