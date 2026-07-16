// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RevelationMinimapProjection.js
 * @description Projects the local map through one cached coordinate index.
 *
 * The Awtsmoos renews the traveler's position without rebuilding the same world
 * around it. Awtsmoos.com keeps one weakly held index for each assembled map.
 */
const MAP_WIDTH = 13;
const MAP_HEIGHT = 7;
const TILE_INDEX_CACHE = new WeakMap();

/**
 * Resolves one coordinate index for a stable assembled registry.
 *
 * @param {object[]} registry Canonical assembled tile array.
 * @returns {Map<string, object>} Coordinate-to-tile index.
 */
export function resolveRevelationTileIndex(registry = []) {
	if (!Array.isArray(registry)) return new Map();
	const cached = TILE_INDEX_CACHE.get(registry);
	if (cached?.length === registry.length) return cached.index;
	const index = new Map();
	for (const tile of registry) {
		if (!tile) continue;
		index.set(`${tile.x}:${tile.y}`, tile);
	}
	TILE_INDEX_CACHE.set(registry, {
		length: registry.length,
		index
	});
	return index;
}

/**
 * Builds the bounded local minimap around the canonical hero position.
 *
 * @param {object} state Canonical state or a read-only projection.
 * @param {object[]} registry Canonical assembled tiles.
 * @returns {{width:number,height:number,cells:object[]}} Minimap model.
 */
export function buildRevelationMinimap(state, registry = []) {
	const heroX = Math.round(numberOr(state.Hero?.cx, 0));
	const heroY = Math.round(numberOr(state.Hero?.cy, 0));
	const originX = heroX - Math.floor(MAP_WIDTH / 2);
	const originY = heroY - Math.floor(MAP_HEIGHT / 2);
	const index = resolveRevelationTileIndex(registry);
	const cells = [];
	for (let row = 0; row < MAP_HEIGHT; row += 1) {
		for (let column = 0; column < MAP_WIDTH; column += 1) {
			const x = originX + column;
			const y = originY + row;
			cells.push({
				x,
				y,
				kind: tileKind(index.get(`${x}:${y}`)),
				hero: x === heroX && y === heroY
			});
		}
	}
	return { width: MAP_WIDTH, height: MAP_HEIGHT, cells };
}

function tileKind(tile) {
	if (!tile) return 'unknown';
	if (tile.isPortal) return 'portal';
	if (tile.encounter || tile.isEnemy) return 'danger';
	if (tile.t === 'G_DIRT_PATH') return 'road';
	if (tile.char === '~' || tile.t?.includes('WATER')) return 'water';
	if (tile.solid) return 'solid';
	return 'ground';
}

function numberOr(value, fallback = 0) {
	return Number.isFinite(Number(value)) ? Number(value) : fallback;
}
