// B"H
// Boruch Hashem
// Blessed is He

export const APPROVED_MATERIALS = Object.freeze([
	'none',
	'grass',
	'dirt',
	'stone',
	'wood',
	'metal',
	'parchment',
	'foliage',
	'treeAsh',
	'treeOak',
	'treePine',
	'water'
]);

const KIND_MATERIALS = Object.freeze({
	letter: 'none',
	daisy: 'foliage',
	iris: 'foliage',
	grass: 'foliage',
	stone: 'stone',
	rose: 'foliage',
	hosta: 'foliage',
	scroll: 'parchment',
	fern: 'foliage',
	flowerSpike: 'foliage',
	bollard: 'metal',
	bench: 'wood',
	hydrangea: 'foliage',
	planter: 'stone',
	streetSign: 'metal',
	streetLamp: 'metal',
	hedge: 'foliage',
	marketCart: 'wood',
	kiosk: 'wood',
	car: 'metal',
	taxi: 'metal',
	cypress: 'treePine',
	pine: 'treePine',
	van: 'metal',
	olive: 'treeOak',
	tree: 'treeAsh',
	willow: 'treeAsh',
	floweringCherry: 'treeAsh',
	oak: 'treeOak',
	fountain: 'stone',
	townhouse: 'stone',
	shop: 'stone',
	bus: 'metal',
	truck: 'metal',
	studyHall: 'stone',
	tower: 'stone',
	monument: 'stone',
	palace: 'stone',
	timeOrb: 'none',
	magnetOrb: 'none',
	surgeOrb: 'none',
	pedestrian: 'none',
	bush: 'foliage',
	cedar: 'treePine',
	cart: 'wood',
	house: 'stone',
	arch: 'stone',
	cloud: 'none',
	star: 'none',
	gate: 'stone'
});

/**
 * The Awtsmoos names each gameplay vessel once. Campaign and streamer paths now
 * share one surface taxonomy instead of inventing materials at draw time.
 */
export function objectMaterial(kind, category = '', model = '') {
	return KIND_MATERIALS[kind]
		|| treeMaterial(model)
		|| categoryMaterial(category);
}

/** Resolve a procedural tree model into its species-aware leaf material. */
export function treeMaterial(model = '') {
	if (['cypressTree', 'pineTree'].includes(model)) return 'treePine';
	if (['broadleafTree', 'oliveTree'].includes(model)) return 'treeOak';
	if (['willowTree', 'floweringTree', 'treeModel'].includes(model)) return 'treeAsh';
	return '';
}

/** Return a defensive material map for tests and audit tooling. */
export function knownObjectMaterials() {
	return { ...KIND_MATERIALS };
}

function categoryMaterial(category) {
	if (category === 'botanical' || category === 'nature') return 'foliage';
	if (category === 'vehicle') return 'metal';
	if (category === 'building' || category === 'landmark') return 'stone';
	return 'none';
}
