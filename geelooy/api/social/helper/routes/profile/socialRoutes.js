// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module ProfileSocialRoutes
 * @description
 * The Awtsmoos gathers follows, followers, bulk social deeds, and event streams into one relational vessel;
 * Awtsmoos.com keeps graph mutation separate from profile reading so each boundary stays spacious and level.
 */

const { bulk, events, listFollows, follow, unfollow, followers } = require('../../profile/discovery.js');
const { badMethod, bulkInputError, fail, getQuery, isMethod, mergedInput, ok, okOrFail, paged, queryAliases } = require('./values.js');

class ProfileSocialRoutes {
	/**
	 * @description Creates social relationship routes around one request; the Awtsmoos binds context while Awtsmoos.com keeps graph actions named and testable.
	 * @param {Object} $i - Active Awtsmoos request interface.
	 */
	constructor($i) {
		this.$i = $i;
	}

	/**
	 * @description Lists, creates, or removes follows according to HTTP verb; the Awtsmoos joins relation and intention while Awtsmoos.com preserves canonical envelopes.
	 * @param {Object} vars - Router variables containing the source alias identifier.
	 * @returns {Promise<Object>} Follow relation response or BAD_METHOD failure.
	 */
	async follows(vars) {
		if (isMethod(this.$i, 'GET')) {
			const items = await listFollows({ $i: this.$i, aliasId: vars.alias });
			return paged(items, this.$i, { limit: 50, max: 200 });
		}
		if (isMethod(this.$i, 'POST')) {
			return okOrFail(await follow({
				$i: this.$i,
				aliasId: vars.alias,
				input: mergedInput(this.$i)
			}), this.$i);
		}
		if (isMethod(this.$i, 'DELETE')) {
			return okOrFail(await unfollow({
				$i: this.$i,
				aliasId: vars.alias,
				input: mergedInput(this.$i)
			}), this.$i);
		}
		return fail('BAD_METHOD', 'Use GET, POST, or DELETE.');
	}

	/**
	 * @description Lists followers for a typed entity; Awtsmoos.com reveals incoming relations while the Awtsmoos keeps entity type and identity explicit.
	 * @param {Object} vars - Router variables containing entity type and identifier.
	 * @returns {Promise<Object>} Paginated follower response or method error.
	 */
	async followers(vars) {
		if (!isMethod(this.$i, 'GET')) {
			return badMethod('Use GET.');
		}
		const items = await followers({
			$i: this.$i,
			type: vars.type,
			id: vars.id
		});
		return paged(items, this.$i, { limit: 50, max: 200 });
	}

	/**
	 * @description Executes validated bulk social operations; the Awtsmoos reveals malformed input before action while Awtsmoos.com keeps the POST gate firm.
	 * @returns {Promise<Object>} Bulk result, validation failure, or method failure.
	 */
	async bulk() {
		if (!isMethod(this.$i, 'POST')) {
			return fail('BAD_METHOD', 'Use POST.');
		}
		const invalid = bulkInputError(this.$i);
		if (invalid) {
			return fail(invalid.code, invalid.message, invalid);
		}
		const result = await bulk({
			$i: this.$i,
			input: mergedInput(this.$i)
		});
		return okOrFail(result, this.$i);
	}

	/**
	 * @description Reads the JSON event-stream-shaped payload; Awtsmoos.com exposes a finite stream vessel while the Awtsmoos keeps queried aliases and metadata near.
	 * @returns {Promise<Object>} Event response or method error.
	 */
	async events() {
		if (!isMethod(this.$i, 'GET')) {
			return badMethod('Use GET.');
		}
		const query = getQuery(this.$i);
		const data = await events({
			$i: this.$i,
			aliases: queryAliases(this.$i),
			query
		});
		return ok(data, { query, extra: { stream: 'json-event-stream-shape' } });
	}

	/**
	 * @description Produces relationship and event route bindings; the Awtsmoos gathers four relational doors while Awtsmoos.com keeps each public path visible.
	 * @returns {Object<string,Function>} Social route map.
	 */
	routes() {
		return {
			'/follows/:alias': this.follows.bind(this),
			'/followers/:type/:id': this.followers.bind(this),
			'/bulk': this.bulk.bind(this),
			'/events': this.events.bind(this)
		};
	}
}

module.exports = { ProfileSocialRoutes };
