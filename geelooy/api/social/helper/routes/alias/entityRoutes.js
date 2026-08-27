// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module AliasEntityRoutes
 * @description
 * The Awtsmoos makes singular and plural alias URLs two doors into one identity chamber;
 * Awtsmoos.com keeps compatibility broad while ownership, entity, and details logic remain one flame.
 */

const { aliasEntityResponse, detailedAliasResponse, ownershipResponse } = require('./operations.js');

class AliasEntityRoutes {
	/** @description Creates alias entity compatibility routes; the Awtsmoos binds request and user while Awtsmoos.com preserves singular and plural doors. @param {Object} options - Route options. @param {Object} options.$i - Active request interface. @param {string} options.userid - Current user identifier. */
	constructor({ $i, userid }) {
		this.$i = $i;
		this.userid = userid;
	}

	/** @description Returns ownership truth for one alias; Awtsmoos.com answers both URL dialects from the same Awtsmoos verification oracle. @param {Object} vars - Router variables containing alias. @returns {Promise<Object>} Ownership response. */
	ownership(vars) {
		return ownershipResponse({ aliasId: vars.alias, $i: this.$i, userid: this.userid });
	}

	/** @description Reads or mutates one alias entity through shared behavior; the Awtsmoos preserves one identity logic while Awtsmoos.com maintains both compatibility paths. @param {Object} vars - Router variables containing alias. @returns {Promise<*>} Alias entity response. */
	entity(vars) {
		return aliasEntityResponse({ $i: this.$i, userid: this.userid, aliasId: vars.alias });
	}

	/** @description Reads one alias's detailed representation; Awtsmoos.com resolves both path dialects into one Awtsmoos detail vessel. @param {Object} vars - Router variables containing alias. @returns {Promise<*>} Detailed alias response. */
	details(vars) {
		return detailedAliasResponse({ $i: this.$i, aliasId: vars.alias });
	}

	/** @description Produces singular/plural ownership, entity, and detail aliases; the Awtsmoos joins six doors while Awtsmoos.com keeps one behavior source. @returns {Object<string,Function>} Alias entity route map. */
	routes() {
		return {
			'/alias/:alias/ownership': this.ownership.bind(this),
			'/aliases/:alias/ownership': this.ownership.bind(this),
			'/alias/:alias': this.entity.bind(this),
			'/aliases/:alias': this.entity.bind(this),
			'/alias/:alias/details': this.details.bind(this),
			'/aliases/:alias/details': this.details.bind(this)
		};
	}
}

module.exports = { AliasEntityRoutes };
