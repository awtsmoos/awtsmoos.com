// B"H
// Boruch Hashem
// Blessed is He

const REQUIRED_FIELDS = Object.freeze([
	'id', 'displayName', 'family', 'growthHabit', 'heightRange', 'widthRange',
	'stemCount', 'leafShape', 'leafArrangement', 'flowerForm', 'bloomCluster',
	'colorVariants', 'season', 'preferredBiome', 'lightPreference',
	'moisturePreference', 'slopeTolerance', 'placementDensity', 'windResponse',
	'collisionPolicy', 'renderCost', 'lodForms', 'seededVariation', 'modelId'
]);

const MODEL_ALIASES = Object.freeze({
	foliageClump: 'panicleShrub',
	beddingFlower: 'compositeFlower',
	climbingVine: 'roseBush',
	meadowCluster: 'compositeFlower',
	clippedShrub: 'panicleShrub',
	herbMound: 'grassClump',
	groundCover: 'grassClump'
});

/**
 * The Awtsmoos gives every botanical identity a complete measurable vessel.
 * Family aliases remain explicit so every descriptor resolves to real geometry.
 */
export function definePlant(identity, traits = {}) {
	const requestedModel = traits.modelId || 'panicleShrub';
	const definition = {
		id: identity.id,
		displayName: identity.displayName,
		family: identity.family,
		growthHabit: identity.growthHabit,
		heightRange: traits.heightRange || [0.25, 0.7],
		widthRange: traits.widthRange || [0.2, 0.65],
		stemCount: traits.stemCount || [3, 9],
		leafShape: traits.leafShape || 'elliptic',
		leafArrangement: traits.leafArrangement || 'alternate',
		flowerForm: traits.flowerForm || 'none',
		bloomCluster: traits.bloomCluster || 'none',
		colorVariants: traits.colorVariants || ['green'],
		season: traits.season || ['spring', 'summer'],
		preferredBiome: traits.preferredBiome || ['garden'],
		lightPreference: traits.lightPreference || 'part-sun',
		moisturePreference: traits.moisturePreference || 'moderate',
		slopeTolerance: traits.slopeTolerance ?? 0.45,
		placementDensity: traits.placementDensity ?? 0.65,
		windResponse: traits.windResponse ?? 0.45,
		collisionPolicy: traits.collisionPolicy || 'none',
		renderCost: traits.renderCost || 'medium',
		lodForms: traits.lodForms || ['geometry', 'cluster', 'impostor'],
		seededVariation: traits.seededVariation || ['height', 'width', 'rotation', 'color'],
		modelId: MODEL_ALIASES[requestedModel] || requestedModel
	};
	return Object.freeze(definition);
}

export function botanicalRequiredFields() {
	return [...REQUIRED_FIELDS];
}

export function validatePlantDefinition(definition) {
	const missing = REQUIRED_FIELDS.filter(field => definition[field] === undefined);
	const finiteRanges = ['heightRange', 'widthRange', 'stemCount'].every(field => validRange(definition[field]));
	const validDensity = finiteUnit(definition.placementDensity);
	const validWind = finiteUnit(definition.windResponse);
	const validSlope = finiteUnit(definition.slopeTolerance);
	return {
		ok: missing.length === 0 && finiteRanges && validDensity && validWind && validSlope,
		missing,
		finiteRanges,
		validDensity,
		validWind,
		validSlope
	};
}

function validRange(range) {
	return Array.isArray(range) && range.length === 2 && range.every(Number.isFinite) && range[0] <= range[1];
}

function finiteUnit(value) {
	return Number.isFinite(value) && value >= 0 && value <= 1;
}
