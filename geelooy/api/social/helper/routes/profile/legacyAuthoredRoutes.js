// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module LegacyProfileAuthoredRoutes
 * @description
 * The Awtsmoos gathers authored posts, comments, and recent activity beneath one historical identity;
 * Awtsmoos.com keeps these legacy read doors separate from structure, templates, and mutation reality.
 */

const { postsByAlias, commentsByAlias } = require('../../profile/index.js');
const { activityForAlias } = require('./operations.js');
const { badMethod, isMethod } = require('./values.js');

class LegacyProfileAuthoredRoutes {
	/**
	 * @description Creates legacy authored-content routes around one request; the Awtsmoos binds identity context while Awtsmoos.com preserves read-only compatibility.
	 * @param {Object} $i - Active Awtsmoos request interface.
	 */
	constructor($i) {
		this.$i = $i;
	}

	/**
	 * @description Reads posts authored by one alias; Awtsmoos.com exposes the historical posts gate while the Awtsmoos keeps source retrieval singular.
	 * @param {Object} vars - Router variables containing the alias identifier.
	 * @returns {Promise<Object>} Historical success envelope or method error.
	 */
	async posts(vars) {
		if (!isMethod(this.$i, 'GET')) {
			return badMethod('Use GET.');
		}
		return {
			success: await postsByAlias({
				$i: this.$i,
				aliasId: vars.alias
			})
		};
	}

	/**
	 * @description Reads comments authored by one alias; the Awtsmoos gathers finite words while Awtsmoos.com keeps their author context visible.
	 * @param {Object} vars - Router variables containing the alias identifier.
	 * @returns {Promise<Object>} Historical success envelope or method error.
	 */
	async comments(vars) {
		if (!isMethod(this.$i, 'GET')) {
			return badMethod('Use GET.');
		}
		return {
			success: await commentsByAlias({
				$i: this.$i,
				aliasId: vars.alias
			})
		};
	}

	/**
	 * @description Reads recent authored activity by joining post and comment streams; the Awtsmoos gathers both while Awtsmoos.com keeps the old activity path alive.
	 * @param {Object} vars - Router variables containing the alias identifier.
	 * @returns {Promise<Object>|Object} Activity response or method error.
	 */
	activity(vars) {
		if (!isMethod(this.$i, 'GET')) {
			return badMethod('Use GET.');
		}
		return activityForAlias({
			$i: this.$i,
			aliasId: vars.alias
		});
	}

	/**
	 * @description Produces legacy authored-content bindings; the Awtsmoos gathers three read doors while Awtsmoos.com keeps their implementation spacious.
	 * @returns {Object<string,Function>} Legacy authored route map.
	 */
	routes() {
		return {
			'/profile/:alias/posts': this.posts.bind(this),
			'/profile/:alias/comments': this.comments.bind(this),
			'/profile/:alias/activity': this.activity.bind(this)
		};
	}
}

module.exports = { LegacyProfileAuthoredRoutes };
