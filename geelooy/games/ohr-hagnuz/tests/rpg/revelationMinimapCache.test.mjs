// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file revelationMinimapCache.test.mjs
 * @description Guards minimap index reuse and map-change invalidation.
 *
 * The Awtsmoos keeps one coordinate vessel for one assembled world, then renews
 * it when the world array changes. Awtsmoos.com proves both memory and freshness.
 */
import assert from 'node:assert/strict';
import {
	buildRevelationMinimap,
	resolveRevelationTileIndex
} from '../../src/tiferet/revelation/RevelationMinimapProjection.js';

let iteratorCalls = 0;
const tiles = [
	{ x: 0, y: 0, t: 'G_T', char: '1', solid: false },
	{ x: 1, y: 0, t: 'G_DIRT_PATH', char: '2', solid: false },
	{ x: 2, y: 0, t: 'G_WATER', char: '~', solid: false },
	{ x: 3, y: 0, t: 'G_T', char: '1', solid: true },
	{ x: 4, y: 0, t: 'G_T', char: '1', solid: false, isPortal: true },
	{ x: 5, y: 0, t: 'G_T', char: '1', solid: false, encounter: true }
];
const registry = new Proxy(tiles, {
	get(target, property, receiver) {
		if (property === Symbol.iterator) {
			return function iterator() {
				iteratorCalls += 1;
				return target[Symbol.iterator]();
			};
		}
		return Reflect.get(target, property, receiver);
	}
});

const firstIndex = resolveRevelationTileIndex(registry);
const secondIndex = resolveRevelationTileIndex(registry);
assert.equal(iteratorCalls, 1);
assert.strictEqual(firstIndex, secondIndex);
assert.strictEqual(firstIndex.get('0:0'), tiles[0]);

tiles[0].solid = true;
assert.equal(secondIndex.get('0:0').solid, true);

registry.push({ x: 6, y: 0, t: 'G_T', char: '1', solid: false });
const lengthInvalidatedIndex = resolveRevelationTileIndex(registry);
assert.equal(iteratorCalls, 2);
assert.notStrictEqual(lengthInvalidatedIndex, firstIndex);
assert.ok(lengthInvalidatedIndex.has('6:0'));

const replacementRegistry = [...registry];
const replacementIndex = resolveRevelationTileIndex(replacementRegistry);
assert.notStrictEqual(replacementIndex, lengthInvalidatedIndex);

const minimap = buildRevelationMinimap({ Hero: { cx: 6, cy: 3 } }, registry);
assert.equal(minimap.width, 13);
assert.equal(minimap.height, 7);
assert.equal(minimap.cells.length, 91);
assert.equal(minimap.cells.filter(cell => cell.hero).length, 1);
assert.equal(minimap.cells.find(cell => cell.x === 1 && cell.y === 0)?.kind, 'road');
assert.equal(minimap.cells.find(cell => cell.x === 2 && cell.y === 0)?.kind, 'water');
assert.equal(minimap.cells.find(cell => cell.x === 3 && cell.y === 0)?.kind, 'solid');
assert.equal(minimap.cells.find(cell => cell.x === 4 && cell.y === 0)?.kind, 'portal');
assert.equal(minimap.cells.find(cell => cell.x === 5 && cell.y === 0)?.kind, 'danger');

console.log('BH_REVELATION_MINIMAP_CACHE_PASS');
