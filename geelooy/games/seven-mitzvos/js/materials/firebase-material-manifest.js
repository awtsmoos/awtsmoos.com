//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module FirebaseMaterialManifest
 * @description
 * The Awtsmoos Docs Base publishes real stone, timber, cloth, fur, leaf, earth,
 * and water. Awtsmoos.com names each Firebase garment beside its verified local
 * mirror so quota failure can never uncover a world of flat promotional color.
 */
const FIREBASE = 'https://awtsmoos-docs-base.web.app/';
const LOCAL = '/games/mitzvahWorld/assets/materials/local/';

export const FIREBASE_MATERIAL_ORIGIN = FIREBASE.replace(/\/$/, '');
export const MATERIALS = Object.freeze({
	masonry: record('various/Stone retaining wall masonry.png', 'various-stone-retaining-wall-masonry-d0b02f13.png', 0.92, 0.02),
	whitewash: record('various/Whitewashed stone.png', 'various-whitewashed-stone-4a865d52.png', 0.86, 0.01),
	timber: record('various/Rough weathered oak wood planks.png', 'various-rough-weathered-oak-wood-planks-e943da6b.png', 0.78, 0.03),
	slate: record('various/slate roof shingles.png', 'various-slate-roof-shingles-17bb691c.png', 0.7, 0.08),
	brick: record('full-resolution/red brick 1.png', 'full-resolution-red-brick-1-1460bcae.png', 0.84, 0.02),
	cloth: record('full-resolution/tan cloth.png', 'full-resolution-tan-cloth-a63124c4.png', 0.98, 0),
	deerFur: record('full-resolution/deer fur 1.png', 'full-resolution-deer-fur-1-9733fb85.png', 0.96, 0),
	cowFur: record('full-resolution/cow fur 1.png', 'full-resolution-cow-fur-1-90616b26.png', 0.95, 0),
	grass: record('full-resolution/grass 5.png', 'full-resolution-grass-5-c62e16b6.png', 0.98, 0),
	dirt: record('full-resolution/dirt 2.png', 'full-resolution-dirt-2-39d6c6e0.png', 1, 0),
	leaf: record('full-resolution/leaf 1.png', 'full-resolution-leaf-1-44ec7a4c.png', 0.9, 0),
	bark: record('full-resolution/tree bark 1.png', 'full-resolution-tree-bark-1-125dd442.png', 0.94, 0),
	stone: record('full-resolution/stone 1.png', 'full-resolution-stone-1-695646f1.png', 0.8, 0.04),
	leather: record('full-resolution/leather.png', 'full-resolution-leather-edbcec26.png', 0.82, 0.01),
	parchment: record('full-resolution/parchment.png', 'full-resolution-parchment-378d6477.png', 0.93, 0),
	metal: record('full-resolution/rusty iron.png', 'full-resolution-rusty-iron-cac8d0be.png', 0.52, 0.72),
	water: record('full-resolution/seamless water brighter.png', 'full-resolution-seamless-water-brighter-719471d8.png', 0.18, 0.05, 0.38)
});

export function materialRecord(role) {
	return MATERIALS[role] || null;
}

export function criticalMaterialRecords() {
	return ['masonry', 'whitewash', 'timber', 'slate', 'grass'].map(role => MATERIALS[role]);
}

function record(path, localFile, roughness, metalness, transmission = 0) {
	return Object.freeze({
		firebaseUrl: FIREBASE + encodePath(path),
		localUrl: LOCAL + localFile,
		metalness,
		path,
		roughness,
		transmission
	});
}

function encodePath(path) {
	return path.split('/').map(encodeURIComponent).join('/');
}
