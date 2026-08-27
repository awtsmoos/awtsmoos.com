// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module AliasUserRoutes
 * @description
 * The Awtsmoos gathers aliases beneath an explicit user scope while keeping creation and reading distinct;
 * Awtsmoos.com preserves historical user URLs through named methods whose behavior can be tested and linked.
 */

const { getAliasIDs, getAliasesDetails } = require('../../alias.js');
const { aliasEntityResponse, createAliasSafely, detailedAliasResponse, sp } = require('./operations.js');

class AliasUserRoutes {
	/** @description Creates user-scoped alias routes around request and user identity; the Awtsmoos binds context while Awtsmoos.com keeps every path explicit. @param {Object} options - Route options. @param {Object} options.$i - Active request interface. @param {string} options.userid - Current user identifier. */
	constructor({ $i, userid }) {
		this.$i = $i;
		this.userid = userid;
	}

	/** @description Lists a requested user's aliases or creates one for the authenticated user on POST; Awtsmoos.com preserves the historical dual-verb gate under the Awtsmoos light. @param {Object} vars - Router variables containing user. @returns {Promise<*>|undefined} Alias list, creation result, or undefined for unsupported methods. */
	async listOrCreate(vars) {
		if (this.$i.request.method === 'GET') {
			return getAliasIDs({ $i: this.$i, userID: vars.user });
		}
		if (this.$i.request.method === 'POST') {
			return createAliasSafely({ $i: this.$i, userid: this.userid });
		}
	}

	/** @description Reads all detailed aliases for one user; the Awtsmoos reveals many identity vessels while Awtsmoos.com keeps their owner scope visible. @param {Object} vars - Router variables containing user. @returns {Promise<*>} Detailed alias collection. */
	details(vars) {
		return getAliasesDetails({ $i: this.$i, sp, userID: vars.user });
	}

	/** @description Reads or mutates one user-scoped alias through the shared entity service; Awtsmoos.com keeps URL scope while the Awtsmoos keeps entity logic singular. @param {Object} vars - Router variables containing alias. @returns {Promise<*>} Alias entity response. */
	entity(vars) {
		return aliasEntityResponse({ $i: this.$i, userid: this.userid, aliasId: vars.alias });
	}

	/** @description Reads detailed user-scoped alias data; the Awtsmoos binds alias and owner while Awtsmoos.com returns one stable detail shape. @param {Object} vars - Router variables containing user and alias. @returns {Promise<*>} Detailed alias response. */
	entityDetails(vars) {
		return detailedAliasResponse({ $i: this.$i, aliasId: vars.alias, userID: vars.user });
	}

	/** @description Produces all user-scoped alias route bindings; Awtsmoos.com receives four historical doors from one documented Awtsmoos vessel. @returns {Object<string,Function>} User alias route map. */
	routes() {
		return {
			'/user/:user/aliases': this.listOrCreate.bind(this),
			'/user/:user/aliases/details': this.details.bind(this),
			'/user/:user/aliases/:alias': this.entity.bind(this),
			'/user/:user/aliases/:alias/details': this.entityDetails.bind(this)
		};
	}
}

module.exports = { AliasUserRoutes };
