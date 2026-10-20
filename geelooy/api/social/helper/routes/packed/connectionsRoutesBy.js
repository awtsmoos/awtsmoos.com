//B"H
//Blessed is He
//Boruch Hashem

/**
 * PackedConnectionsRoutes lookups: connections by post and by citation reference (split from connectionsRoutes.js).
 */

const { findIncomingCitations } = require('../../packed/connectionsMatch.js');

module.exports = {
	/** @description Serves ?post=<postId>: outgoing citations + incoming references. @param {Object} data Loaded index data. @param {string} postId Post id. @param {number} limit Result cap. @returns {Promise<Object>} Connections payload. */
	async byPost(data, postId, limit) {
		const fwd = data.forward.get(postId) || [];
		const outgoing = fwd.slice(0, limit).map((entry) => ({
			key: entry.key,
			raw: entry.raw,
			para: entry.para,
			kind: entry.kind
		}));
		const incomingRaw = findIncomingCitations(postId, data.reverse);
		const incoming = await this.enrichEntries(incomingRaw, limit);
		return {
			post: postId,
			outgoing,
			incoming,
			meta: {
				outgoingCount: fwd.length,
				incomingCount: incomingRaw.length,
				indexFiles: data.meta.files.length,
				forwardPosts: data.meta.forwardPosts,
				reverseKeys: data.meta.reverseKeys,
				indexedAt: data.meta.loadedAt
			}
		};
	},

	/** @description Serves ?ref=<citationKey>: every post citing the exact key. @param {Object} data Loaded index data. @param {string} ref Citation key. @param {number} limit Result cap. @returns {Promise<Object>} Reverse-lookup payload. */
	async byRef(data, ref, limit) {
		const key = data.reverse.has(ref) ? ref : (data.reverse.has(ref.trim()) ? ref.trim() : ref);
		const entries = (data.reverse.get(key) || []).map((entry) => ({ ...entry, key }));
		const citations = await this.enrichEntries(entries, limit);
		return {
			ref: key,
			count: entries.length,
			citations,
			meta: {
				indexFiles: data.meta.files.length,
				reverseKeys: data.meta.reverseKeys,
				indexedAt: data.meta.loadedAt
			}
		};
	}
};
