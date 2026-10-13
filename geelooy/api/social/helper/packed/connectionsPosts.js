// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module PackedConnectionsPosts
 * @description
 * Resolves a citing postId to its display title and canonical reader link.
 * Uses the packed store's bare-postId suffix lookup (newest-first reverse
 * scan — fast for recently imported posts) and caches results in memory.
 * When the post is not found in packed storage, falls back honestly to the
 * raw postId as the label with no link, never an invented title.
 */

const { readPackedKeyAsync } = require('./packedReader.js');

const CACHE_LIMIT = 5000;
const refCache = new Map(); // postId -> { post, postTitle, heichel, href }

/** @description Extracts heichelId from a packed logical key /posts/<heichel>/<postId>. @param {string} key Packed key. @returns {string|null} Heichel id. */
function heichelFromKey(key) {
	const m = String(key || '').match(/^\/posts\/([^/]+)\//);
	return m ? m[1] : null;
}

/**
 * @description Resolves one post reference to title + link.
 * @param {Object} $i Active Awtsmoos request interface.
 * @param {string} postId Post identifier.
 * @returns {Promise<{post: string, postTitle: string, heichel: string|null, href: string|null}>} Reference.
 */
async function resolvePostRef($i, postId) {
	const id = String(postId || '').trim();
	if (!id) return { post: id, postTitle: id, heichel: null, href: null };
	const hit = refCache.get(id);
	if (hit) return hit;

	let resolved = { post: id, postTitle: id, heichel: null, href: null };
	try {
		const result = await readPackedKeyAsync({ $i, shard: 'core', key: id });
		const record = result && result.success;
		const value = record && (record.value || record);
		if (value && typeof value === 'object') {
			const heichel = heichelFromKey(record.key) || value.heichelId || value.heichel || null;
			const title = value.title || value.name || id;
			resolved = {
				post: id,
				postTitle: String(title),
				heichel,
				href: heichel ? '/heichelos/' + heichel + '/post/' + id : null
			};
		}
	} catch (_) {
		// Keep the honest fallback below.
	}

	if (refCache.size >= CACHE_LIMIT) {
		const oldest = refCache.keys().next().value;
		refCache.delete(oldest);
	}
	refCache.set(id, resolved);
	return resolved;
}

/** @description Clears the reference cache (tests only). @returns {void} */
function clearPostRefCache() {
	refCache.clear();
}

module.exports = { resolvePostRef, clearPostRefCache };
