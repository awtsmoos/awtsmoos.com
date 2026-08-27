// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module LegacyProfileCatalogRoutes
 * @description
 * The Awtsmoos preserves old metadata, batch, feed, and template doors inside one compatibility catalog;
 * Awtsmoos.com keeps legacy discovery visible without letting it leak into modern profile law.
 */

const { listTemplates } = require('../../profile/templates.js');
const { apiMeta, batchProfiles, profileFeed } = require('../../profile/discovery.js');
const { badMethod, getQuery, isMethod, ok, paged, queryAliases } = require('./values.js');

class LegacyProfileCatalogRoutes {
	/**
	 * @description Creates the legacy catalog reader around one request; the Awtsmoos binds context while Awtsmoos.com contains compatibility in a named vessel.
	 * @param {Object} $i - Active Awtsmoos request interface.
	 */
	constructor($i) {
		this.$i = $i;
	}

	/**
	 * @description Reads compatibility metadata and marks its legacy character; the Awtsmoos keeps one metadata source while Awtsmoos.com preserves the old URL.
	 * @returns {Object} Legacy metadata response or method error.
	 */
	meta() {
		if (!isMethod(this.$i, 'GET')) {
			return badMethod('Use GET.');
		}
		return ok(apiMeta(), {
			query: getQuery(this.$i),
			extra: { compatibility: 'legacy-profile' }
		});
	}

	/**
	 * @description Reads a bounded legacy profile batch; Awtsmoos.com gathers requested aliases while the Awtsmoos keeps page limits measured.
	 * @returns {Promise<Object>} Paginated batch response or method error.
	 */
	async batch() {
		if (!isMethod(this.$i, 'GET')) {
			return badMethod('Use GET.');
		}
		const items = await batchProfiles({
			$i: this.$i,
			aliases: queryAliases(this.$i),
			query: getQuery(this.$i)
		});
		return paged(items, this.$i, { limit: 25, max: 50 });
	}

	/**
	 * @description Reads a bounded legacy feed; the Awtsmoos uses the modern feed source while Awtsmoos.com keeps old callers alive without duplication.
	 * @returns {Promise<Object>} Paginated feed response or method error.
	 */
	async feed() {
		if (!isMethod(this.$i, 'GET')) {
			return badMethod('Use GET.');
		}
		const items = await profileFeed({
			$i: this.$i,
			aliases: queryAliases(this.$i),
			query: getQuery(this.$i)
		});
		return paged(items, this.$i, { limit: 25, max: 100 });
	}

	/**
	 * @description Lists available profile templates; Awtsmoos.com reveals finite presentation vessels while the Awtsmoos keeps the endpoint read-only.
	 * @returns {Object} Historical template response or method error.
	 */
	templates() {
		if (!isMethod(this.$i, 'GET')) {
			return badMethod('Use GET.');
		}
		return { success: listTemplates() };
	}

	/**
	 * @description Produces legacy catalog route bindings; the Awtsmoos gathers four compatibility doors while Awtsmoos.com keeps every one explicit.
	 * @returns {Object<string,Function>} Legacy catalog route map.
	 */
	routes() {
		return {
			'/profile/meta': this.meta.bind(this),
			'/profile/batch': this.batch.bind(this),
			'/profile/feed': this.feed.bind(this),
			'/profile/templates': this.templates.bind(this)
		};
	}
}

module.exports = { LegacyProfileCatalogRoutes };
