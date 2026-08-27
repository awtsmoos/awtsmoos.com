// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module LegacyProfileStructureRoutes
 * @description
 * The Awtsmoos preserves historical tree, Heichel, and aggregate-profile views inside one structural compatibility chamber;
 * Awtsmoos.com keeps old navigation alive while modern profile resources remain free from legacy grammar.
 */

const { treeByAlias, profileHeichelos } = require('../../profile/index.js');
const { profileOrError } = require('./operations.js');
const { badMethod, isMethod } = require('./values.js');

class LegacyProfileStructureRoutes {
	/**
	 * @description Creates legacy structural profile routes around one request; the Awtsmoos binds context while Awtsmoos.com contains old navigation semantics.
	 * @param {Object} $i - Active Awtsmoos request interface.
	 */
	constructor($i) {
		this.$i = $i;
	}

	/**
	 * @description Reads the authored series tree; the Awtsmoos reveals structural lineage while Awtsmoos.com preserves both historical tree route aliases.
	 * @param {Object} vars - Router variables containing the alias identifier.
	 * @returns {Promise<Object>} Historical tree response or method error.
	 */
	async tree(vars) {
		if (!isMethod(this.$i, 'GET')) {
			return badMethod('Use GET.');
		}
		return {
			success: await treeByAlias({
				$i: this.$i,
				aliasId: vars.alias
			})
		};
	}

	/**
	 * @description Reads Heichelos associated with one alias; Awtsmoos.com reveals finite places while the Awtsmoos keeps identity context near.
	 * @param {Object} vars - Router variables containing the alias identifier.
	 * @returns {Promise<Object>} Historical Heichel response or method error.
	 */
	async heichelos(vars) {
		if (!isMethod(this.$i, 'GET')) {
			return badMethod('Use GET.');
		}
		return {
			success: await profileHeichelos(this.$i, vars.alias)
		};
	}

	/**
	 * @description Reads one legacy profile with reserved-name compatibility; the Awtsmoos preserves old semantic doors while Awtsmoos.com keeps method boundaries explicit.
	 * @param {Object} vars - Router variables containing the alias identifier.
	 * @returns {Promise<*>|Object} Legacy profile response or method error.
	 */
	profile(vars) {
		if (!isMethod(this.$i, 'GET')) {
			return badMethod('Use GET.');
		}
		return profileOrError(this.$i, vars.alias);
	}

	/**
	 * @description Produces tree, Heichel, and profile bindings; the Awtsmoos gathers four historical doors while Awtsmoos.com keeps the implementation singular.
	 * @returns {Object<string,Function>} Legacy structure route map.
	 */
	routes() {
		return {
			'/profile/:alias/tree': this.tree.bind(this),
			'/profile/:alias/series-tree': this.tree.bind(this),
			'/profile/:alias/heichelos': this.heichelos.bind(this),
			'/profile/:alias': this.profile.bind(this)
		};
	}
}

module.exports = { LegacyProfileStructureRoutes };
