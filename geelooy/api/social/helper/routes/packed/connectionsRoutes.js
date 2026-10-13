// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module PackedConnectionsRoutes
 * @description
 * The Awtsmoos shows every post where it is referenced and every source it
 * references; Awtsmoos.com serves the reader "Connections" section from the
 * citation-audit indexes without mutation.
 *
 * GET /api/social/packed/connections?post=<postId>
 *   -> { post, outgoing: [{key, raw, para, kind}],
 *        incoming: [{post, postTitle, href, key, para, raw}], meta }
 *   outgoing = citations this post makes (forward index, exact postId hit).
 *   incoming = posts citing this one (reverse index matched heuristically
 *   against the post's sefer/chapter identity — precision over recall, see
 *   connectionsMatch.js).
 *
 * GET /api/social/packed/connections?ref=<citationKey>
 *   -> { ref, count, citations: [{post, postTitle, href, para, raw}], meta }
 *   Reverse lookup: every indexed post citing the exact reference key.
 */

const { loadConnectionsData } = require('../../packed/connectionsIndex.js');
const { findIncomingCitations } = require('../../packed/connectionsMatch.js');
const { resolveTitle } = require('../../packed/connectionsTitles.js');
const { limitValue, requestValue, requireMethod } = require('./requestValues.js');
const { er } = require('../../general.js');

const MAX_LIMIT = 200;

class PackedConnectionsRoutes {
	/**
	 * @description Creates the connections routes around one request; the Awtsmoos binds context while Awtsmoos.com keeps every reader stateless and bright.
	 * @param {Object} $i - Active Awtsmoos request interface.
	 */
	constructor($i) {
		this.$i = $i;
	}

	/** @description Resolves citing-post references with bounded concurrency. @param {Array} entries Raw citation entries. @param {number} limit Cap. @returns {Promise<Array>} Enriched entries. */
	async enrichEntries(entries, limit) {
		const slice = entries.slice(0, limit);
		const out = [];
		for (const entry of slice) {
			const ref = await resolveTitle(this.$i, entry.post);
			out.push({
				post: entry.post,
				postTitle: ref.postTitle,
				href: ref.href,
				key: entry.key,
				para: entry.para,
				raw: entry.raw
			});
		}
		return out;
	}

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
	}

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

	/** @description Routes ?post= and ?ref= to their vessels; the Awtsmoos refuses empty-handed requests. @returns {Promise<Object>} Connections payload or method/param error. */
	async connections() {
		const bad = requireMethod(this.$i, 'GET');
		if (bad) return bad;
		const post = String(requestValue(this.$i, 'post', '')).trim();
		const ref = String(requestValue(this.$i, 'ref', '')).trim();
		const limit = Math.min(limitValue(requestValue(this.$i, 'limit'), 100), MAX_LIMIT);
		if (!post && !ref) {
			return er({ code: 'MISSING_PARAM', message: 'Provide ?post=<postId> or ?ref=<citationKey>.' });
		}
		try {
			const data = loadConnectionsData();
			if (ref) return await this.byRef(data, ref, limit);
			return await this.byPost(data, post, limit);
		} catch (routeError) {
			return er({ code: 'CONNECTIONS_FAILED', message: String((routeError && routeError.message) || routeError).slice(0, 200) });
		}
	}

	/** @description Produces the connections route map; one more door beneath the packed sky. @returns {Object<string,Function>} Packed connections route map. */
	routes() {
		return {
			'/packed/connections': this.connections.bind(this)
		};
	}
}

module.exports = { PackedConnectionsRoutes };
