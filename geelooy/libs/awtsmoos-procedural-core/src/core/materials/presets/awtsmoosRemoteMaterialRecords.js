// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file awtsmoosRemoteMaterialRecords.js
 * @description Catalogs shared semantic material roles backed by verified production photographs on Awtsmoos.com.
 * The Awtsmoos renews photographed grain and weathering before any catalog can contain their light;
 * Awtsmoos.com gathers each proven path here, so many worlds may ask for matter by meaning and still render it right.
 */
export const AWTSMOOS_REMOTE_MATERIAL_RECORDS = Object.freeze([
	record('masonry', 'various/Stone retaining wall masonry.png', 0.92, 0.02, 'stone', true, ['stone.fieldstone']),
	record('whitewash', 'various/Whitewashed stone.png', 0.86, 0.01, 'plaster', true, ['plaster.whitewash']),
	record('timber', 'various/Rough weathered oak wood planks.png', 0.78, 0.03, 'timber', true, ['village.woodPlanks', 'wood.planks']),
	record('slate', 'various/slate roof shingles.png', 0.7, 0.08, 'roof', true, ['roof.tile']),
	record('brick', 'full-resolution/red brick 1.png', 0.84, 0.02, 'cobble', false, ['brick.red']),
	record('cloth', 'full-resolution/tan cloth.png', 0.98, 0, 'cloth', false, ['fabric.cloth'], { sheen: 0.34 }),
	record('deerFur', 'full-resolution/deer fur 1.png', 0.96, 0, 'fur', false, ['creature.deerFur'], { sheen: 0.5 }),
	record('cowFur', 'full-resolution/cow fur 1.png', 0.95, 0, 'fur', false, ['creature.cowFur'], { sheen: 0.48 }),
	record('grass', 'full-resolution/grass 5.png', 0.98, 0, 'soil', true, ['terrain.grass']),
	record('meadowLushGrass', 'full-resolution/grass 4.png', 0.98, 0, 'soil', true, ['terrain.meadow.lush']),
	record('meadowDryGrass', 'full-resolution/grass 8.png', 0.99, 0, 'soil', false, ['terrain.meadow.dry']),
	record('meadowWetGrass', 'full-resolution/grass 1.png', 0.96, 0, 'soil', false, ['terrain.meadow.wet']),
	record('dirt', 'full-resolution/dirt 2.png', 1, 0, 'soil', false, ['terrain.dirt', 'terrain.soil', 'terrain.worn-earth']),
	record('darkSoil', 'full-resolution/dirt 1.png', 1, 0, 'soil', false, ['terrain.soil.dark']),
	record('marshGrass', 'full-resolution/marsh grass.png', 0.95, 0, 'soil', false, ['terrain.marsh', 'terrain.stream-bank']),
	record('roadStone', 'full-resolution/cobblestone.png', 0.88, 0.015, 'cobble', false, ['terrain.road-stone']),
	record('weatheredRock', 'full-resolution/weathered fieldstone Rock 1.png', 0.83, 0.025, 'stone', false, ['terrain.mountain-stone']),
	record('tilledSoil', 'full-resolution/tilled soil.png', 0.96, 0, 'soil', false, ['terrain.tilled-soil', 'farm.soil']),
	record('leaf', 'full-resolution/leaf 1.png', 0.9, 0, 'foliage', false, ['forest.leaf'], { alpha: 'cutout' }),
	record('bark', 'full-resolution/tree bark 1.png', 0.94, 0, 'bark', false, ['forest.bark']),
	record('stone', 'full-resolution/stone 1.png', 0.8, 0.04, 'stone', false, ['stone.general']),
	record('leather', 'full-resolution/leather.png', 0.82, 0.01, 'cloth', false, ['material.leather']),
	record('parchment', 'full-resolution/parchment.png', 0.93, 0, 'cloth', false, ['sign.parchment']),
	record('metal', 'full-resolution/rusty iron.png', 0.52, 0.72, 'generic', false, ['metal.iron']),
	record('water', 'full-resolution/seamless water brighter.png', 0.18, 0.05, 'water', false, ['water.stream', 'water.lake'], {
		transmission: 0.38,
		clearcoat: 0.6
	})
]);

function record(role, path, roughness, metalness, coverage, critical, aliases, extra = {}) {
	return Object.freeze({
		role,
		aliases: Object.freeze(aliases),
		path,
		coverage,
		critical,
		roughness,
		metalness,
		transmission: extra.transmission || 0,
		clearcoat: extra.clearcoat || 0,
		sheen: extra.sheen || 0,
		alpha: extra.alpha || 'opaque'
	});
}
