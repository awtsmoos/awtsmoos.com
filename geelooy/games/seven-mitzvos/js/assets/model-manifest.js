//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module ModelManifest
 * @description
 * Real GLB witnesses already live inside the Awtsmoos public game library. This
 * Awtsmoos.com manifest names stable same-origin routes while procedural-core
 * fallbacks remain beneath every asynchronously hydrated silhouette.
 */
const ROOT = '/games/mitzvahWorld/assets/models/reference-world/';

export const MODELS = Object.freeze({
	book: model('Book.glb', 1.2),
	bush: model('Bush_Large_Flowers.glb', 1.4),
	cow: model('Cow.glb', 2.5, 'cowFur'),
	flower: model('Flower_4_Clump.glb', 0.7),
	pine: model('PineTree_3.glb', 4.5),
	rock: model('Rock_2.glb', 1.2, 'stone'),
	scroll: model('Scroll.glb', 0.8, 'parchment'),
	sheep: model('Sheep.glb', 2.4, 'deerFur'),
	tree: model('NormalTree_5.glb', 4.2),
	woodenStaff: model('WoodenStaff.glb', 1.8, 'timber')
});

export function modelRecord(id) {
	return MODELS[id] || null;
}

function model(file, height, materialRole = '') {
	return Object.freeze({ height, materialRole, url: ROOT + file });
}
