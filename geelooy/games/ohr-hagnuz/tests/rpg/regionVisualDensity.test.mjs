// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file regionVisualDensity.test.mjs
 * @description Guards deterministic regional detail and protected gameplay truth.
 *
 * The Awtsmoos renews variation without letting appearance seize authority.
 * Awtsmoos.com proves here that themes and props remain stable, bounded, and visual.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { visualSeed, visualUnit } from '../../src/graphics/render/detail/VisualSeed.js';
import { WorldDetailPlanner } from '../../src/graphics/render/detail/WorldDetailPlanner.js';
import { resolveRegionVisualTheme } from '../../src/graphics/render/theme/RegionVisualTheme.js';

const readSource = relativePath => readFileSync(
	fileURLToPath(new URL(relativePath, import.meta.url)),
	'utf8'
);

const marsh = resolveRegionVisualTheme('Bent_Reeds_Marsh');
const desert = resolveRegionVisualTheme('Sector_Gimmel');
const frost = resolveRegionVisualTheme('Sector_YudDalet');
const luminous = resolveRegionVisualTheme('Sector_Atzilut');
const verdant = resolveRegionVisualTheme('Overworld_Main');

assert.equal(marsh.id, 'marsh');
assert.equal(desert.id, 'desert');
assert.equal(frost.id, 'frost');
assert.equal(luminous.id, 'luminous');
assert.equal(verdant.id, 'verdant');
assert.notDeepEqual(marsh.water, desert.water);
assert.notDeepEqual(frost.tree, verdant.tree);

const firstSeed = visualSeed(14, 9, 3);
assert.equal(firstSeed, visualSeed(14, 9, 3));
assert.notEqual(firstSeed, visualSeed(15, 9, 3));
assert.ok(visualUnit(firstSeed, 2) >= 0 && visualUnit(firstSeed, 2) <= 1);

const protectedTiles = [
	{ x: 1, y: 1, char: '1', t: 'G_GRASS', isPortal: true },
	{ x: 2, y: 1, char: '1', t: 'G_GRASS', isSoul: true },
	{ x: 3, y: 1, char: '1', t: 'G_GRASS', encounter: true },
	{ x: 4, y: 1, char: '.', t: 'G_DIRT_PATH' }
];
for (const tile of protectedTiles) {
	assert.deepEqual(WorldDetailPlanner.plan(tile, marsh), []);
}

const candidates = [];
for (let y = 0; y < 20; y += 1) {
	for (let x = 0; x < 20; x += 1) {
		candidates.push({ x, y, char: '~', t: 'G_WATER', solid: true });
		candidates.push({ x, y, char: '1', t: 'G_GRASS', solid: false });
		candidates.push({ x, y, char: 'T', t: 'G_TREE_OAK', solid: true });
		candidates.push({ x, y, char: 'W', t: 'G_WALL_STONE', solid: true });
	}
}

const plannedKinds = new Set();
for (const tile of candidates) {
	const before = structuredClone(tile);
	const firstPlan = WorldDetailPlanner.plan(tile, marsh);
	const secondPlan = WorldDetailPlanner.plan(tile, marsh);
	assert.deepEqual(firstPlan, secondPlan);
	assert.deepEqual(tile, before);
	for (const detail of firstPlan) plannedKinds.add(detail.kind);
}

assert.ok(plannedKinds.has('REEDS'));
assert.ok(plannedKinds.has('MOSS_ROCK'));
assert.ok(plannedKinds.has('RUIN_FRAGMENT'));
assert.ok(plannedKinds.has('SHRUB'));

const queueSource = readSource('../../src/graphics/render/engine/RenderQueueBuilder.js');
const treeSources = [
	readSource('../../src/graphics/render/flora/OakWeaver.js'),
	readSource('../../src/graphics/render/flora/PineWeaver.js'),
	readSource('../../src/graphics/render/flora/PalmWeaver.js')
].join('\n');
assert.match(queueSource, /WORLD_DETAIL/);
assert.match(queueSource, /WorldDetailPlanner/);
assert.doesNotMatch(treeSources, /trunkH|moveTo\(0, size\s*\/\s*2\)/);
assert.match(treeSources, /Math\.PI \* 2/);

console.log('BH_REGION_VISUAL_DENSITY_PASS');
