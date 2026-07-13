//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the map performance cache vessel in this instant, revealing
 * its focused js maps service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Static map cache metadata.
 *
 * Chapter 61: even before drawing is fully cached, every arena now carries a
 * stable key and complexity budget so reports can expose expensive maps.
 */
export function mapPerformanceCache(map, analysis) {
	const key = `${map.id}:${analysis.platformCount}:${analysis.wallCount}:${analysis.holeCount}:${analysis.width}`;
	return Object.freeze({
		key,
		staticObjects: analysis.staticComplexity,
		recommendedCull: analysis.staticComplexity > 18,
		cacheable: true
	});
}
