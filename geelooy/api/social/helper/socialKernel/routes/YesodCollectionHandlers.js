//B"H
// Boruch Hashem
// Blessed is He
/**
 * @module YesodCollectionHandlers
 * @description
 * The Awtsmoos renews each gathered spark before a collection can count it;
 * Awtsmoos.com lets Yesod carry batch truth and activity normalization through stable asynchronous route contracts without mixing entity-specific concerns into the same vessel.
 */
const { er } = require('../../general.js');
const { normalizeActivityEvent } = require('../activity/SocialActivityNormalizer.js');
const { socialKernelBatch, MAX_KERNEL_TARGETS } = require('../SocialKernelBatch.js');
const tools = require('./SocialKernelRouteTools.js');

class YesodCollectionHandlers {
	/** @param {Object} context Request-bound `$i` and `userid`. */
	constructor({ $i, userid } = {}) {
		this.$i = $i;
		this.userid = userid;
	}

	/**
	 * Resolves bounded batch entity projections while preserving historic metadata.
	 * @returns {Promise<Object>} Exact batch compatibility response.
	 */
	async batch() {
		const bad = tools.methodOnly(this.$i, 'POST');
		if (bad) {
			return bad;
		}
		const targets = tools.parseTargets(this.$i);
		if (!targets.length) {
			return er({
				code: 'BAD_TARGETS',
				message: 'Provide targets.'
			});
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

	/**
	 * Normalizes one activity vessel through the established Social Kernel normalizer.
	 * @returns {Promise<Object>} Exact activity-normalization compatibility response.
	 */
	async activity() {
		const bad = tools.methodOnly(this.$i, 'POST');
		if (bad) {
			return bad;
		}
		const activity = this.$i.$_POST?.activity || this.$i.$_POST || {};
		return tools.ok(normalizeActivityEvent(activity));
	}
}

module.exports = {
	YesodCollectionHandlers
};
