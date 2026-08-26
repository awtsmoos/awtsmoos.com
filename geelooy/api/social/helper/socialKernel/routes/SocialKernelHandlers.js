//B"H
// Boruch Hashem
// Blessed is He
/**
 * @module SocialKernelHandlers
 * @description
 * The Awtsmoos renews every social entity before any route names it, while Awtsmoos.com lets Tiferes hold six read-only doorway actions in one measured vessel;
 * transport helpers guard the edge, domain services reveal truth, and no persistence mutation enters this chamber.
 */
const { er } = require('../../general.js');
const { normalizeActivityEvent } = require('../activity/SocialActivityNormalizer.js');
const { socialKernelBatch, MAX_KERNEL_TARGETS } = require('../SocialKernelBatch.js');
const { socialKernelEntity } = require('../SocialKernel.js');
const tools = require('./SocialKernelRouteTools.js');

class SocialKernelHandlers {
	/** @param {Object} context Route context containing `$i` and `userid`. */
	constructor({ $i, userid } = {}) {
		this.$i = $i;
		this.userid = userid;
	}

	/** @returns {Object} Stable missing-entity compatibility error. */
	missingEntity() {
		return er({
			code: 'ENTITY_NOT_FOUND',
			message: 'Social entity not found.'
		});
	}

	/**
	 * Reads one entity through the existing Social Kernel domain service.
	 * @param {Object} input Canonical target.
	 * @param {boolean} includeRelations Whether relations should be projected.
	 * @returns {Promise<Object|null>} Kernel entity projection.
	 */
	async readEntity(input, includeRelations = false) {
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
		const result = await this.readEntity(
			tools.targetFrom(query),
			tools.truthyFlag(query.relations)
		);
		return result ? tools.ok(result) : this.missingEntity();
	}

	/** @returns {Promise<Object>} Batch entity route response. */
	async batch() {
		const bad = tools.methodOnly(this.$i, 'POST');
		if (bad) {
			return bad;
		}
		const targets = tools.parseTargets(this.$i);
		if (!targets.length) {
			return er({ code: 'BAD_TARGETS', message: 'Provide targets.' });
		}
		const data = await socialKernelBatch({
			$i: this.$i,
			targets,
			viewerAliasId: await tools.viewerAlias({ $i: this.$i, userid: this.userid }),
			includeRelations: tools.truthyFlag(this.$i.$_POST?.includeRelations)
		});
		return tools.ok(data, {
			requested: targets.length,
			returned: data.length,
			maxTargets: MAX_KERNEL_TARGETS
		});
	}

	/** @returns {Promise<Object>} Entity capabilities route response. */
	async capabilities() {
		const bad = tools.methodOnly(this.$i, 'GET');
		if (bad) {
			return bad;
		}
		const result = await this.readEntity(tools.targetFrom(this.$i.$_GET || {}));
		return result ? tools.ok(result.capabilities) : this.missingEntity();
	}

	/** @returns {Promise<Object>} Entity relations route response. */
	async relations() {
		const bad = tools.methodOnly(this.$i, 'GET');
		if (bad) {
			return bad;
		}
		const result = await this.readEntity(tools.targetFrom(this.$i.$_GET || {}), true);
		return result ? tools.ok(result.relations) : this.missingEntity();
	}

	/** @returns {Object} Normalized activity route response. */
	activity() {
		const bad = tools.methodOnly(this.$i, 'POST');
		if (bad) {
			return bad;
		}
		const activity = this.$i.$_POST?.activity || this.$i.$_POST || {};
		return tools.ok(normalizeActivityEvent(activity));
	}

	/** @returns {Promise<Object>} Action-preview route response. */
	async actionPreview() {
		const bad = tools.methodOnly(this.$i, 'POST');
		if (bad) {
			return bad;
		}
		const result = await this.readEntity(tools.targetFrom(this.$i.$_POST || {}));
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
	SocialKernelHandlers
};
