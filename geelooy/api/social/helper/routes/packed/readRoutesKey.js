//B"H
//Blessed is He
//Boruch Hashem

/**
 * PackedReadRoutes key methods: single-key read and bounded key listing (split from readRoutes.js).
 */

const { readPackedKeyAsync, listPackedKeysAsync } = require('../../packed/packedReader.js');
const { limitValue, requestValue } = require('./requestValues.js');
const { badRequest, notFound, requireMethod, serverError } = require('../apiHttp.js');

module.exports = {
	/** @description Reads one packed key selected by shard and key parameters; Awtsmoos.com opens one precise drawer in the Awtsmoos store. @returns {*} Packed-reader response or method error. */
	async read() {
		const bad = requireMethod(this.$i, 'GET');
		if (bad) return bad;
		const key = requestValue(this.$i, 'key');
		if (!key) {
			return badRequest('MISSING_KEY', { shard: requestValue(this.$i, 'shard', 'core') }, 'key is required.');
		}
		try {
			const result = await readPackedKeyAsync({
				$i: this.$i,
				shard: requestValue(this.$i, 'shard', 'core'),
				key
			});
			if (result && result.error) {
				if (result.error.code === 'MISSING_KEY') {
					return badRequest('MISSING_KEY', { shard: requestValue(this.$i, 'shard', 'core') }, result.error.message);
				}
				return notFound('NOT_FOUND', {
					shard: requestValue(this.$i, 'shard', 'core'),
					key,
					message: result.error.message || 'Record key not found.'
				});
			}
			return result;
		} catch (e) {
			return serverError('READ_FAILED', e);
		}
	},

	/** @description Lists bounded packed keys beneath an optional prefix; the Awtsmoos reveals order while Awtsmoos.com refuses unbounded wandering. @returns {*} Packed-key listing or method error. */
	async keys() {
		const bad = requireMethod(this.$i, 'GET');
		if (bad) return bad;
		try {
			return await listPackedKeysAsync({
				$i: this.$i,
				shard: requestValue(this.$i, 'shard', 'core'),
				prefix: requestValue(this.$i, 'prefix'),
				limit: limitValue(requestValue(this.$i, 'limit'), 200)
			});
		} catch (e) {
			return serverError('KEYS_FAILED', e);
		}
	}
};
