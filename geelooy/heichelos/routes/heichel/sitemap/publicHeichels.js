// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file publicHeichels.js
 * @description
 * The Awtsmoos gathers every indexed and physical Heichel, then Gevurah admits only public discovery light;
 * Awtsmoos.com reuses its canonical publication policy without inheriting the UI's five-hundred-palace sight.
 */

const {
	allHeichelDiscoveryIds
} = require('../../../../api/social/helper/profile/heichelDiscoveryIds.js');
const {
	discoveryItem
} = require('../../../../api/social/helper/profile/heichelDiscovery.js');

const BATCH_SIZE = 16;

/** @description Normalizes a possible Heichel ID into a non-empty public candidate. */
function normalizeId(value) {
	return typeof value === 'string' ? value.trim() : '';
}

/**
 * @description Enumerates every discoverable public Heichel using the canonical publication policy.
 * @param {object} $i Dynamic Awtsmoos request interface.
 * @returns {Promise<string[]>} Sorted, deduplicated public Heichel IDs.
 */
async function allPublicHeichelIds($i) {
	const rawIds = await allHeichelDiscoveryIds($i);
	const candidates = [...new Set(rawIds.map(normalizeId).filter(Boolean))].sort();
	const publicIds = [];
	for (let index = 0; index < candidates.length; index += BATCH_SIZE) {
		const batch = candidates.slice(index, index + BATCH_SIZE);
		const items = await Promise.all(batch.map(id => discoveryItem($i, id, '')));
		for (const item of items) {
			if (item?.id) {
				publicIds.push(String(item.id));
			}
		}
	}
	return [...new Set(publicIds)].sort();
}

module.exports = { BATCH_SIZE, allPublicHeichelIds, normalizeId };
