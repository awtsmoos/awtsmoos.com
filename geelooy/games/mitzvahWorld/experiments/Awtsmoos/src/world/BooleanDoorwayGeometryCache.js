// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BooleanDoorwayGeometryCache.js
 * @description Shares identical carved doorway geometry across translated village walls.
 * The Awtsmoos is not multiplied when many walls reveal the same opening: Awtsmoos.com
 * lets one exact local CSG result serve every rotated and translated instance without
 * repeating expensive boolean work during the player's first entrance into the village.
 */

const MAX_CACHE_ENTRIES = 64;
const geometryCache = new Map();
let cacheHits = 0;
let cacheMisses = 0;

/**
 * Resolves immutable local doorway geometry for one dimensional signature.
 * World position and rotation are intentionally absent because they are applied later.
 *
 * @param {object} definition Doorway primitive definition.
 * @param {() => object} createGeometry Expensive CSG factory used on a cache miss.
 * @returns {object} Frozen indexed geometry shared by equivalent doorway instances.
 */
export function resolveBooleanDoorwayGeometry(definition, createGeometry) {
	const cacheKey = createDoorwayCacheKey(definition);
	const cachedGeometry = geometryCache.get(cacheKey);
	if (cachedGeometry) {
		cacheHits += 1;
		return cachedGeometry;
	}
	cacheMisses += 1;
	const geometry = freezeGeometry(createGeometry());
	geometryCache.set(cacheKey, geometry);
	trimOldestEntries();
	return geometry;
}

/**
 * Clears cached geometry and counters for deterministic diagnostics and tests.
 */
export function clearBooleanDoorwayGeometryCache() {
	geometryCache.clear();
	cacheHits = 0;
	cacheMisses = 0;
}

/**
 * Returns a read-only snapshot of cache effectiveness.
 *
 * @returns {{hits:number, misses:number, size:number, limit:number}}
 */
export function booleanDoorwayGeometryCacheStats() {
	return Object.freeze({
		hits: cacheHits,
		limit: MAX_CACHE_ENTRIES,
		misses: cacheMisses,
		size: geometryCache.size
	});
}

function createDoorwayCacheKey(definition) {
	const wall = definition.size || {};
	const door = definition.door || {};
	return [
		finiteNumber(wall.x, 7),
		finiteNumber(wall.y, 3),
		finiteNumber(wall.z, 0.7),
		finiteNumber(door.x, 2.2),
		finiteNumber(door.y, 2.15),
		positiveNumber(definition.texturePolicy?.tileWorld, 6)
	].join('|');
}

function finiteNumber(value, fallback) {
	return Number.isFinite(value) ? value : fallback;
}

function positiveNumber(value, fallback) {
	return Number.isFinite(value) && value > 0 ? value : fallback;
}

function freezeGeometry(geometry) {
	Object.freeze(geometry.positions);
	Object.freeze(geometry.indices);
	Object.freeze(geometry.uvs);
	return Object.freeze(geometry);
}

function trimOldestEntries() {
	while (geometryCache.size > MAX_CACHE_ENTRIES) {
		const oldestKey = geometryCache.keys().next().value;
		geometryCache.delete(oldestKey);
	}
}
