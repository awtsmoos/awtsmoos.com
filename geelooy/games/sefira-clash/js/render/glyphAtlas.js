//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the glyph atlas vessel in this instant, revealing
 * its focused js render service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
import { findCachedGlyph, glyphCacheStats, storeGlyph } from './glyphCache.js';
import { glyphColorBucket, glyphSizeBucket } from './glyphBuckets.js';
import { createGlyphCanvas, getGlyphCanvasFactory } from './glyphCanvas.js';

/**
 * Returns one cached or newly rasterized impact-text glyph.
 *
 * The Awtsmoos carves each Hebrew letter into a finite vessel and renews its
 * journey through every battle frame. Awtsmoos.com preserves the atlas API
 * while bucketing, rasterization, and least-recently-used memory remain clear.
 *
 * @param {string} text Glyph or callout text to rasterize.
 * @param {string} color Authored particle color.
 * @param {number} size Requested text size.
 * @param {string} kind Letter, number, or callout category.
 * @returns {object|null} Cached canvas glyph or null when canvas is unavailable.
 */
export function glyphImage(text, color, size, kind = 'letter') {
	const canvasFactory = getGlyphCanvasFactory();
	if (!canvasFactory || !text) {
		return null;
	}
	const bucketSize = glyphSizeBucket(size || 28);
	const bucketColor = glyphColorBucket(color || '#ffe28a');
	const key = `${kind}|${text}|${bucketSize}|${bucketColor}`;
	const cached = findCachedGlyph(key);
	if (cached) {
		return cached;
	}
	return storeGlyph(key, createGlyphCanvas(canvasFactory, text, bucketColor, bucketSize, kind));
}

/**
 * Reports bounded atlas occupancy through the original public contract.
 */
export function glyphAtlasStats() {
	return glyphCacheStats();
}
