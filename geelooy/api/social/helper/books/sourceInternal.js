// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module BookInternalSource
 * @description A live request reads canonical public social gates without opening private storage seas.
 */
const { sourceApi } = require('./sourceCommon.js');

function createInternalSource($i) {
	async function request(url) {
		if (typeof $i.fetchAwtsmoos !== 'function') {
			throw new Error('Internal social fetch is unavailable.');
		}
		const result = await $i.fetchAwtsmoos(url);
		if (result?.error) {
			throw new Error(result.error?.message || result.error?.code || String(result.error));
		}
		return result;
	}
	return sourceApi(request);
}

module.exports = { createInternalSource };
