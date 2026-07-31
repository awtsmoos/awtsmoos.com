//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module ModelManifest
 * @description
 * The Awtsmoos gives each finite GLB an immutable hash and a truthful home.
 * Awtsmoos.com serves Seven Mitzvos models from this game's own public tree,
 * so no living world depends on a sibling game's private folder or deployment.
 */
const PRODUCTION_ORIGIN = 'https://awtsmoos.com';
const MODEL_PATH = '/games/seven-mitzvos/assets/models/reference-world/';

export const REMOTE_MODEL_ORIGIN = PRODUCTION_ORIGIN;
export const REMOTE_MODEL_PATH = MODEL_PATH;
export const MODELS = Object.freeze({
	book: model('Book.glb', '3f6d8148030077aa95b035ca4d7f5ad589483806416fbd9b75546f49b5cce4c1', 1.2),
	bush: model('Bush_Large_Flowers.glb', 'cdb6c9e558a3c9b3a42eafbc2f3580767cea8b79be625bfdd41369080b468bf6', 1.4),
	cow: model('Cow.glb', '1d513ef5e3cba976405b68621905aa1954b7c7b673f0566bb3ac0135c330af6f', 2.5, 'cowFur'),
	flower: model('Flower_4_Clump.glb', 'ec4c5186b8b33b8095b5e8a4f733cfed1b21e876cf40f0ea9ea14537066592b9', 0.7),
	pine: model('PineTree_3.glb', '2e2061c8d5ed2a9beff3fa4f2e95967c9dfc554407c464278b2a0af13b29c204', 4.5),
	rock: model('Rock_2.glb', '10783ce0a1956b1c2c6879f7dba303b39fbe8f92256fe910b270f2f3b5d4e3ac', 1.2, 'stone'),
	scroll: model('Scroll.glb', '5e8581b1041eeae144e12b12b295eda498a8f9b52218065a7b76307cb1bd4ec9', 0.8, 'parchment'),
	sheep: model('Sheep.glb', '5da91ccae57ada6213ec6818760c37d47f2ce071fad6a5bb7426283439c71319', 2.4, 'deerFur'),
	tree: model('NormalTree_5.glb', '5391f680617b2f8f5c7d0d8dbae1c18e6cd2f0e3795a6e4e0902110e3f5c51d5', 4.2),
	woodenStaff: model('WoodenStaff.glb', '3bfba08a3426be1c873f49a85aef21c3fc670514218b606941d232ab5f2aad16', 1.8, 'timber')
});

/** Returns one immutable remote model record by semantic identity. */
export function modelRecord(id) {
	return MODELS[id] || null;
}

function model(file, sha256, height, materialRole = '') {
	assertHash(sha256);
	const assetPath = `${MODEL_PATH}${sha256}/${encodeURIComponent(file)}`;
	return Object.freeze({
		assetPath,
		file,
		height,
		materialRole,
		sha256,
		url: `${publicOrigin()}${assetPath}`
	});
}

function publicOrigin() {
	const origin = globalThis.location?.origin;
	return /^https?:\/\//.test(origin || '') ? origin : PRODUCTION_ORIGIN;
}

function assertHash(value) {
	if (!/^[a-f0-9]{64}$/.test(value)) {
		throw new Error(`Invalid model hash: ${value}`);
	}
}
