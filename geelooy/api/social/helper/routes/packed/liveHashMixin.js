//B"H
//Blessed is He
//Boruch Hashem

/** @module LiveHashMixin
 * Live-content hash lookups for idempotency: which posts already exist
 * in the packed shards, and with what content hash. Targeted O(1)
 * lookups only - full shard scans are forbidden (they stalled imports).
 */

const { listPackedRecords, readPacked, forEachLineFastAsync, fileRoot, fastKeyType } = require('../../packed/socialPacked.js');
const { logicalKey } = require('../../packed/shardPaths.js');
const { contentHash } = require('./postValidate.js');

module.exports = {

	// -- idempotency ----------------------------------------------------------
	// A post is "already imported" when the live core record's content hash
	// matches the incoming document's hash. Same bytes in = skip, no write.
	// Different bytes = overwrite (counts as updated). Missing = write.
	//
	// The live hashes are loaded ONCE per job (buildLiveHashCache) instead
	// of readPacked-per-post: on production the core shard is a multi-GB
	// JSONL file and re-reading it per post made the import O(n^2)
	// (~25s/post, stalling after ~60 posts).
	buildLiveHashCache($i, heichelId) {
		const cache = new Map();
		const prefix = '/posts/' + heichelId + '/';
		let records;
		try {
			records = listPackedRecords({ $i, shard: 'core' });
		} catch (_) {
			return cache;
		}
		for (const rec of records) {
			const key = rec && rec.key;
			if (typeof key !== 'string' || !key.startsWith(prefix)) continue;
			const postId = key.slice(prefix.length);
			try {
				cache.set(postId, contentHash(rec.value));
			} catch (_) { /* skip unhashable records */ }
		}
		return cache;
	},


	// B"H 2026-10-11: async variant — streams the core shard with
	// event-loop yields and parses ONLY lines whose key matches this
	// heichel's prefix. The old sync full-parse blocked the loop for ~45s
	// on the 3.9 GB production shard (and readFileSync crashed >2 GiB).
	// B"H 2026-10-15 (import-speed-fix): targeted lookup — instead of scanning
	// the entire 3.9 GB core shard, do direct O(1) key lookups for just the
	// posts in this batch. A 50-post batch = 50 fast lookups, not a 45s scan.
	// Yaakov's law: DB operations must be fast, never full table scans.
	buildLiveHashCacheForPosts($i, heichelId, postIds) {
		const cache = new Map();
		for (const postId of postIds) {
			try {
				const key = logicalKey(['posts', heichelId, postId]);
				const result = readPacked({ $i, shard: 'core', key });
				// readPacked returns the value directly in production (native store),
				// or a {key, value} record in file mode. Handle both.
				const live = result && result.value ? result.value : result;
				if (live && typeof live === 'object') {
					try { cache.set(postId, contentHash(live)); } catch (_) { /* skip */ }
				}
			} catch (_) { /* missing = not live, skip */ }
		}
		return cache;
	},


	async buildLiveHashCacheAsync($i, heichelId) {
		const cache = new Map();
		const prefix = '/posts/' + heichelId + '/';
		const root = fileRoot($i);
		if (!root) return this.buildLiveHashCache($i, heichelId);
		await forEachLineFastAsync(root, 'core', (head, getFull) => {
			const fast = fastKeyType(head);
			if (fast && typeof fast.key === 'string' && !fast.key.startsWith(prefix)) return;
			let rec;
			try { rec = JSON.parse(getFull()); } catch (_) { return; }
			const key = rec && rec.key;
			if (typeof key !== 'string' || !key.startsWith(prefix)) return;
			const postId = key.slice(prefix.length);
			if (rec.op === 'del') { cache.delete(postId); return; }
			const post = rec.value;
			if (!post) return;
			try { cache.set(post.postId || postId, contentHash(post)); } catch (_) { /* skip */ }
		});
		return cache;
	},


	// Legacy single-post check (kept for compatibility; the job loop uses
	// the bulk cache above).
	postAlreadyLive($i, post, hash) {
		try {
			const key = logicalKey(['posts', post.heichelId, post.postId]);
			const record = readPacked({ $i, shard: 'core', key });
			const live = record && record.value ? record.value : null;
			if (!live) return false;
			return contentHash(live) === hash;
		} catch (_) {
			return false;
		}
	},


	postExists($i, post) {
		try {
			const key = logicalKey(['posts', post.heichelId, post.postId]);
			const record = readPacked({ $i, shard: 'core', key });
			return !!(record && record.value);
		} catch (_) {
			return false;
		}
	}
};
