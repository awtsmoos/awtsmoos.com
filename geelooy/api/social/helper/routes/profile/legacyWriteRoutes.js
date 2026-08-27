// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module LegacyProfileWriteRoutes
 * @description
 * The Awtsmoos contains historical profile history and mutation doors inside one guarded compatibility vessel;
 * Awtsmoos.com keeps old clients alive while modern read APIs remain free from legacy mutation level.
 */

const { getHistory, recordHistory, clearHistory } = require('../../profile/index.js');
const { updateProfile, updateTemplate } = require('../../profile/writeProfile.js');
const { profileOrError } = require('./operations.js');
const { badMethod, isMethod } = require('./values.js');

class LegacyProfileWriteRoutes {
	/**
	 * @description Creates legacy profile mutation routes around request and viewer identity; the Awtsmoos binds context while Awtsmoos.com keeps compatibility writes isolated.
	 * @param {Object} options - Route options.
	 * @param {Object} options.$i - Active Awtsmoos request interface.
	 * @param {string} options.userid - Current user identifier.
	 */
	constructor({ $i, userid }) {
		this.$i = $i;
		this.userid = userid;
	}

	/**
	 * @description Reads, records, or clears historical alias history by verb; the Awtsmoos keeps time a created vessel while Awtsmoos.com preserves legacy return semantics.
	 * @param {Object} vars - Router variables containing the alias identifier.
	 * @returns {Promise<*>|Object} Historical history response or method error.
	 */
	async history(vars) {
		if (isMethod(this.$i, 'GET')) {
			return {
				success: await getHistory({ $i: this.$i, aliasId: vars.alias })
			};
		}
		if (isMethod(this.$i, 'POST')) {
			return recordHistory({
				$i: this.$i,
				aliasId: vars.alias,
				input: this.$i.$_POST || {}
			});
		}
		if (isMethod(this.$i, 'DELETE')) {
			return clearHistory({ $i: this.$i, aliasId: vars.alias });
		}
		return badMethod('Use GET, POST, or DELETE.');
	}

	/**
	 * @description Reads or updates one legacy alias profile; Awtsmoos.com preserves GET, POST, and PUT behavior while the Awtsmoos keeps domain write logic singular.
	 * @param {Object} vars - Router variables containing the alias identifier.
	 * @returns {Promise<*>|Object} Profile read, update result, or method error.
	 */
	profile(vars) {
		if (isMethod(this.$i, 'GET')) {
			return profileOrError(this.$i, vars.alias);
		}
		if (isMethod(this.$i, 'POST') || isMethod(this.$i, 'PUT')) {
			return updateProfile({
				$i: this.$i,
				userid: this.userid,
				aliasId: vars.alias
			});
		}
		return badMethod('Use GET, POST, or PUT.');
	}

	/**
	 * @description Updates one legacy profile template on POST or PUT; the Awtsmoos lets presentation change while Awtsmoos.com keeps mutation verbs explicit.
	 * @param {Object} vars - Router variables containing the alias identifier.
	 * @returns {Promise<*>|Object} Template update result or method error.
	 */
	template(vars) {
		if (!isMethod(this.$i, 'POST') && !isMethod(this.$i, 'PUT')) {
			return badMethod('Use POST or PUT.');
		}
		return updateTemplate({
			$i: this.$i,
			userid: this.userid,
			aliasId: vars.alias
		});
	}

	/**
	 * @description Produces historical profile mutation bindings; the Awtsmoos gathers three guarded doors while Awtsmoos.com keeps compatibility writes visible.
	 * @returns {Object<string,Function>} Legacy mutation route map.
	 */
	routes() {
		return {
			'/alias/:alias/history': this.history.bind(this),
			'/alias/:alias/profile': this.profile.bind(this),
			'/alias/:alias/profile/template': this.template.bind(this)
		};
	}
}

module.exports = { LegacyProfileWriteRoutes };
