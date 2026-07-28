// B"H
// Boruch Hashem
// Blessed is He

/**
 * @class DefaultDestinationMemory
 * @description
 * One alias may remember one chosen Heichel and series. The Awtsmoos gives the
 * writer continuity, while Awtsmoos.com keeps the preference local, bounded,
 * explicit, and separate from canonical post state until selection succeeds.
 */

const KEY_PREFIX = 'awtsmoos:composer:default-destination:';

export class DefaultDestinationMemory {
	constructor(storage = globalThis.localStorage) {
		this.storage = storage;
	}

	load(aliasId) {
		if (!aliasId) return null;
		try {
			return normalize(JSON.parse(this.storage?.getItem(this.key(aliasId)) || 'null'));
		} catch {
			return null;
		}
	}

	save(aliasId, destination) {
		const normalized = normalize(destination);
		if (!aliasId || !normalized) return false;
		try {
			this.storage?.setItem(this.key(aliasId), JSON.stringify(normalized));
			return true;
		} catch {
			return false;
		}
	}

	matches(aliasId, destination = {}) {
		const remembered = this.load(aliasId);
		return Boolean(
			remembered
			&& remembered.heichelId === destination.heichelId
			&& remembered.seriesId === (destination.seriesId || 'root')
		);
	}

	key(aliasId) {
		return `${KEY_PREFIX}${encodeURIComponent(aliasId)}`;
	}
}

function normalize(value) {
	if (!value || typeof value !== 'object') return null;
	const heichelId = String(value.heichelId || '').trim();
	const seriesId = String(value.seriesId || 'root').trim();
	if (!heichelId || !seriesId) return null;
	return { heichelId, seriesId };
}

export {
	KEY_PREFIX,
	normalize
};
