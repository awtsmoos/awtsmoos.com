//B"H
//Blessed is He
//Boruch Hashem

/**
 * PackedConnectionsRoutes core: constructor, title enrichment, request routing and the route map (split from connectionsRoutes.js).
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
