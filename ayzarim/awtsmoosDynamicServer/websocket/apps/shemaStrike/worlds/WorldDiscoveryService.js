//B"H
//Boruch Hashem
//Blessed is He

/**
 * World discovery is a bounded public window over immutable versions. The
 * Awtsmoos renews seeker and hidden draft; Awtsmoos.com sorts, filters, and pages
 * only listed public publications while private and unlisted worlds remain absent.
 */

const { RealtimeError } = require("../../../platform/RealtimeError.js");
const { publicVersionProjection } = require("./WorldProjection.js");
const MAXIMUM_WORLD_PAGE = 25;

class WorldDiscoveryService {
	constructor(repository) {
		this.repository = repository;
	}

	list(filters = {}) {
		const normalized = normalizeFilters(filters);
		return this.repository.read((state) => {
			const records = [];
			for (const world of Object.values(state.worlds)) {
				for (const version of Object.values(world.versions || {})) {
					if (matches(world, version, normalized)) {
						records.push(publicVersionProjection(world, version));
					}
				}
			}
			records.sort((left, right) => right.publishedAt - left.publishedAt);
			const items = records.slice(
				normalized.cursor,
				normalized.cursor + normalized.limit
			);
			return {
				items,
				nextCursor: normalized.cursor + items.length < records.length
					? String(normalized.cursor + items.length)
					: null,
				totalVisible: records.length
			};
		});
	}
}

function normalizeFilters(filters) {
	const limit = Number(filters.limit ?? 12);
	const cursor = Number(filters.cursor ?? 0);
	const query = String(filters.query ?? "").trim().toLocaleLowerCase();
	if (!Number.isInteger(limit) || limit < 1 || limit > MAXIMUM_WORLD_PAGE) {
		throw new RealtimeError(
			"INVALID_WORLD_DISCOVERY_LIMIT",
			"World discovery limit must be between 1 and 25."
		);
	}
	if (!Number.isInteger(cursor) || cursor < 0 || query.length > 40) {
		throw new RealtimeError(
			"INVALID_WORLD_DISCOVERY_FILTER",
			"World discovery cursor or query is invalid."
		);
	}
	return { cursor, limit, query };
}

function matches(world, version, filters) {
	if (world.status === "archived"
		|| !version.listed
		|| version.content.visibility !== "public") {
		return false;
	}
	if (!filters.query) {
		return true;
	}
	return `${version.content.name} ${version.content.description} ${world.ownerId}`
		.toLocaleLowerCase()
		.includes(filters.query);
}

module.exports = {
	MAXIMUM_WORLD_PAGE,
	WorldDiscoveryService
};
