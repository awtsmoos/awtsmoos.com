//B"H
//Blessed is He
//Boruch Hashem

/**
 * @module SocialPackedShardRouting
 * @description
 * B"H 2026-10-20 (json-migration M0): per-shard engine routing flags for
 * the packed facade (socialPacked.js). Each shard independently resolves
 * to 'file' (the JSONL append-log), 'db' (AwtsmoosDB), or null — the
 * legacy rule, under which a request-local file root selects JSONL and
 * anything else selects AwtsmoosDB.
 *
 * Every shard ships null, so production behavior is exactly unchanged.
 * A shard is flipped only inside its migration swap window (DESIGN.md
 * phases M1–M6): the converted AwtsmoosDB data, this flag, and the
 * service restart land together — never the flag alone, never the data
 * alone. Flipping a shard back to null (or to 'file' while its JSONL
 * file is still archived in place) is the rollback lever.
 */

const SHARD_ENGINE_OVERRIDES = {
	core: null,
	allPosts: null,
	meta: null,
	graph: null,
	notify: null,
	audit: null,
	search: null,
	feed: null
};

/**
 * Returns the routing override for one shard.
 * @param {string} shard - Shard name (see shardPaths.js SHARDS).
 * @returns {string|null} 'db', 'file', or null for the legacy rule.
 */
function engineOverride(shard) {
	const value = SHARD_ENGINE_OVERRIDES[shard];
	return value === 'db' || value === 'file' ? value : null;
}

module.exports = { SHARD_ENGINE_OVERRIDES, engineOverride };
