//B"H
// Boruch Hashem
// Blessed is He
/**
 * @module TiferesEntityHandlers
 * @description
 * The Awtsmoos renews each social entity before capability, relation, or action can be named;
 * Awtsmoos.com lets Tiferes hold the balanced read-paths together while transport and persistence remain separately framed.
 */
const { er } = require('../../general.js');
const { socialKernelEntity } = require('../SocialKernel.js');
const tools = require('./SocialKernelRouteTools.js');

class TiferesEntityHandlers {
	/** @param {Object} context Request-bound `$i` and `userid`. */
	constructor({ $i, userid } = {}) {
		this.$i = $i;
		this.userid = userid;
	}

	/** @returns {Object} Stable legacy missing-entity response. */
	missingEntity() {
		return er({
			code: 'ENTITY_NOT_FOUND',
			message: 'Social entity not found.'
		});
	}

	/**
	 * Projects one entity with verified viewer context.
	 * @param {Object} input Canonical kernel target.
	 * @param {boolean} includeRelations Whether relations should be included.
	 * @returns {Promise<Object|null>} Kernel projection.
	 */
	async read(input, includeRelations = false) {
		return socialKernelEntity({
			$i: this.$i,
			input,
			viewerAliasId: await tools.viewerAlias({ $i: this.$i, userid: this.userid }),
			includeRelations
		});
	}

	/** @returns {Promise<Object>} Full entity route response. */
	async entity() {
		const bad = tools.methodOnly(this.$i, 'GET');
		if (bad) {
			return bad;
		}
		const query = this.$i.$_GET || {};
		const result = await this.read(
			tools.targetFrom(query),
			tools.truthyFlag(query.relations)
		);
		return result ? tools.ok(result) : this.missingEntity();
	}

	/** @returns {Promise<Object>} Entity capabilities response. */
	async capabilities() {
		const bad = tools.methodOnly(this.$i, 'GET');
		if (bad) {
			return bad;
		}
		const result = await this.read(tools.targetFrom(this.$i.$_GET || {}));
		return result ? tools.ok(result.capabilities) : this.missingEntity();
	}

	/** @returns {Promise<Object>} Entity relations response. */
	async relations() {
		const bad = tools.methodOnly(this.$i, 'GET');
		if (bad) {
			return bad;
		}
		const result = await this.read(tools.targetFrom(this.$i.$_GET || {}), true);
		return result ? tools.ok(result.relations) : this.missingEntity();
	}

	/** @returns {Promise<Object>} Described action-preview response. */
	async actionPreview() {
		const bad = tools.methodOnly(this.$i, 'POST');
		if (bad) {
			return bad;
		}
		const result = await this.read(tools.targetFrom(this.$i.$_POST || {}));
		const action = result?.actions?.find(item => item.id === this.$i.$_POST?.actionId);
		if (action) {
			return tools.ok(action);
		}
		return er({
			code: 'ACTION_NOT_FOUND',
			message: 'Action is not described for this entity.'
		});
	}
}

module.exports = {
	TiferesEntityHandlers
};
