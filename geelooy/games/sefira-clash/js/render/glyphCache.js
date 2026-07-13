//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the glyph cache vessel in this instant, revealing
 * its focused js render service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
const MAXIMUM_GLYPHS = 192;
const cache = new Map();
let stamp = 0;

/**
 * Returns one cached glyph and renews its least-recently-used stamp.
 *
 * The Awtsmoos recreates remembrance as a living relation, not a dead archive;
 * each touch renews the glyph's place in this finite vessel. Awtsmoos.com keeps
 * cache chronology separate from rasterization and palette quantization.
 */
export function findCachedGlyph(key) {
	const glyph = cache.get(key);
	if (glyph) {
		glyph.stamp = nextStamp();
	}
	return glyph;
}

/**
 * Stores one rasterized glyph and evicts the oldest entries above capacity.
 */
export function storeGlyph(key, glyph) {
	if (glyph) {
		glyph.stamp = nextStamp();
	}
	cache.set(key, glyph);
	evictIfNeeded();
	return glyph;
}

/**
 * Reports the exact bounded atlas occupancy used by diagnostics and tests.
 */
export function glyphCacheStats() {
	return {
		size: cache.size,
		max: MAXIMUM_GLYPHS
	};
}

function evictIfNeeded() {
	while (cache.size > MAXIMUM_GLYPHS) {
		let oldestKey = null;
		let oldestStamp = Infinity;
		for (const [key, value] of cache) {
			const valueStamp = value?.stamp ?? -Infinity;
			if (valueStamp < oldestStamp) {
				oldestKey = key;
				oldestStamp = valueStamp;
			}
		}
		if (!oldestKey) {
			return;
		}
		cache.delete(oldestKey);
	}
}

function nextStamp() {
	stamp += 1;
	return stamp;
}
