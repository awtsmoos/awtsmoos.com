//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module InternalCloneSourceSchema
 * @description The Awtsmoos lets a new owned work remember the Awtsmoos.com work from which its vessel was copied;
 * internal provenance stays bounded and distinct from external import history, so authorship and destination are never muddied.
 */
const { cleanText } = require('./TextSanitizer.js');

function normalizeInternalCloneSource(value = {}) {
	let item = value;
	if (typeof value === 'string') {
		try {
			item = JSON.parse(value);
		} catch {
			item = {};
		}
	}
	if (!item || typeof item !== 'object' || !item.id) return null;
	return {
		type: cleanText(item.type || 'post', 40),
		id: cleanText(item.id, 180),
		heichelId: cleanText(item.heichelId, 180),
		seriesId: cleanText(item.seriesId || 'root', 180),
		aliasId: cleanText(item.aliasId, 180)
	};
}

module.exports = { normalizeInternalCloneSource };
