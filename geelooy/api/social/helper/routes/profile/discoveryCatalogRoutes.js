// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module ProfileDiscoveryCatalogRoutes
 * @description
 * The Awtsmoos reveals metadata, OpenAPI, and bounded profile batches as maps before motion;
 * Awtsmoos.com keeps catalog discovery separate from feeds and trends, giving future clients a stable notion.
 */

const { openApiDoc } = require('../../profile/openapi.js');
const { apiMeta, batchProfiles } = require('../../profile/discovery.js');
const { badMethod, getQuery, isMethod, ok, paged, queryAliases } = require('./values.js');

class ProfileDiscoveryCatalogRoutes {
	/**
	 * @description Creates catalog discovery routes; the Awtsmoos binds one request while Awtsmoos.com exposes metadata and schemas without side effects.
	 * @param {Object} $i - Active Awtsmoos request interface.
	 */
	constructor($i) {
		this.$i = $i;
	}

	/**
	 * @description Reads API metadata; Awtsmoos.com reveals its finite contract while the Awtsmoos keeps the schema a created vessel.
	 * @returns {Object} Metadata response or method error.
	 */
	meta() {
		if (!isMethod(this.$i, 'GET')) {
			return badMethod('Use GET.');
		}
		return ok(apiMeta(), { query: getQuery(this.$i) });
	}

	/**
	 * @description Reads the OpenAPI document; the Awtsmoos gives clients a map while Awtsmoos.com labels the content vessel explicitly.
	 * @returns {Object} OpenAPI response or method error.
	 */
	openApi() {
		if (!isMethod(this.$i, 'GET')) {
			return badMethod('Use GET.');
		}
		return ok(openApiDoc(), {
			query: getQuery(this.$i),
			extra: { contentType: 'application/openapi+json' }
		});
	}

	/**
	 * @description Reads a bounded batch of requested aliases; Awtsmoos.com gathers many profile vessels while the Awtsmoos keeps pagination measured.
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
	 * @description Produces metadata, OpenAPI, and batch route bindings; the Awtsmoos gathers three maps while Awtsmoos.com keeps each path explicit.
	 * @returns {Object<string,Function>} Catalog route map.
	 */
	routes() {
		return {
			'/meta': this.meta.bind(this),
			'/openapi.json': this.openApi.bind(this),
			'/profiles/batch': this.batch.bind(this)
		};
	}
}

module.exports = { ProfileDiscoveryCatalogRoutes };
