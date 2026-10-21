//B"H
//Blessed is He
//Boruch Hashem

/**
 * @module ReadingAnalyticsRoutesPrivacy
 * @description
 * Prototype-mixin sibling of ReadingAnalyticsRoutes: privacy method, relocated verbatim.
 */

const readingStore = require('../../reading/readingStore.js');
const { badMethod, fail, isMethod, ok } = require('../profile/values.js');
const { readBody } = require('./readingRoutesHelpers.js');

module.exports = {
	/**
	 * GET /api/reading/privacy — get own privacy level.
	 * PUT /api/reading/privacy — set own privacy level.
	 */
	async privacy() {
		if (!this.userid) return fail('NOT_AUTHENTICATED', 'Sign in to manage privacy.');

		if (isMethod(this.$i, 'GET')) {
			const level = readingStore.getPrivacy(this.userid);
			return ok({ BH: 'B"H', level });
		}

		if (isMethod(this.$i, 'PUT')) {
			const body = await readBody(this.$i);
			try {
				const level = readingStore.setPrivacy(this.userid, body.level);
				return ok({ BH: 'B"H', level, updated: true });
			} catch (err) {
				return fail('INVALID_LEVEL', 'Level must be private, friends, or public.');
			}
		}

		return badMethod('Use GET or PUT.');
	},
};
