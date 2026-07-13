// B"H
// Boruch Hashem
// Blessed is He
import { definePlant } from './schema.js';

/** Tree identities vary crown architecture, foliage rhythm, moisture, and scale. */
export const TREE_PLANTS = Object.freeze([
	definePlant(
		{ id: 'cypress', displayName: 'Highland Cypress', family: 'Cupressaceae', growthHabit: 'narrow evergreen column' },
		{ modelId: 'cypressTree', leafShape: 'scale sprays', leafArrangement: 'dense vertical shell', season: ['all'], heightRange: [4, 15], widthRange: [0.9, 3.5], stemCount: [1, 3], colorVariants: ['deep-green', 'blue-green'], preferredBiome: ['hillside', 'garden'], moisturePreference: 'dry', slopeTolerance: 0.9, windResponse: 0.34, collisionPolicy: 'trunk', renderCost: 'high' }
	),
	definePlant(
		{ id: 'oak', displayName: 'Valley Oak', family: 'Fagaceae', growthHabit: 'broad spreading deciduous tree' },
		{ modelId: 'broadleafTree', leafShape: 'deeply lobed', leafArrangement: 'branching crown pads', season: ['spring', 'summer', 'autumn'], heightRange: [7, 24], widthRange: [6, 20], stemCount: [1, 2], colorVariants: ['green', 'amber-autumn'], preferredBiome: ['meadow-edge', 'woodland'], slopeTolerance: 0.65, windResponse: 0.58, collisionPolicy: 'trunk', renderCost: 'high' }
	),
	definePlant(
		{ id: 'willow', displayName: 'Canal Willow', family: 'Salicaceae', growthHabit: 'weeping deciduous tree' },
		{ modelId: 'willowTree', leafShape: 'narrow lanceolate', leafArrangement: 'pendent curtains', season: ['spring', 'summer', 'autumn'], heightRange: [5, 18], widthRange: [5, 16], stemCount: [1, 4], colorVariants: ['yellow-green', 'silver-green'], preferredBiome: ['streamside', 'canal'], moisturePreference: 'wet', slopeTolerance: 0.4, windResponse: 0.9, collisionPolicy: 'trunk', renderCost: 'high' }
	),
	definePlant(
		{ id: 'pine', displayName: 'Mountain Pine', family: 'Pinaceae', growthHabit: 'tiered evergreen conifer' },
		{ modelId: 'pineTree', leafShape: 'needle bundles', leafArrangement: 'tiered whorls', season: ['all'], heightRange: [5, 22], widthRange: [2.5, 9], stemCount: [1, 2], colorVariants: ['forest-green', 'blue-green'], preferredBiome: ['mountain', 'woodland'], moisturePreference: 'dry', slopeTolerance: 0.95, windResponse: 0.45, collisionPolicy: 'trunk', renderCost: 'medium' }
	),
	definePlant(
		{ id: 'floweringCherry', displayName: 'Lantern Cherry', family: 'Rosaceae', growthHabit: 'small flowering canopy tree' },
		{ modelId: 'floweringTree', leafShape: 'serrated oval', leafArrangement: 'arching crown sprays', flowerForm: 'five-petal cup', bloomCluster: 'dense branch clouds', colorVariants: ['blush-pink', 'white'], season: ['spring', 'summer', 'autumn'], heightRange: [3.5, 11], widthRange: [3, 10], preferredBiome: ['garden', 'plaza'], windResponse: 0.72, collisionPolicy: 'trunk', renderCost: 'high' }
	),
	definePlant(
		{ id: 'magnolia', displayName: 'Terrace Magnolia', family: 'Magnoliaceae', growthHabit: 'upright flowering tree' },
		{ modelId: 'floweringTree', leafShape: 'large glossy oval', leafArrangement: 'open layered crown', flowerForm: 'large waxy cup', bloomCluster: 'solitary branch tips', colorVariants: ['cream', 'rose-white'], season: ['spring', 'summer'], heightRange: [4, 14], widthRange: [3.5, 11], preferredBiome: ['garden', 'courtyard'], windResponse: 0.55, collisionPolicy: 'trunk', renderCost: 'high' }
	),
	definePlant(
		{ id: 'dogwood', displayName: 'Woodland Dogwood', family: 'Cornaceae', growthHabit: 'layered understory tree' },
		{ modelId: 'floweringTree', leafShape: 'opposite oval', leafArrangement: 'horizontal branch tiers', flowerForm: 'four showy bracts', bloomCluster: 'branch-tip constellations', colorVariants: ['white', 'soft-pink'], season: ['spring', 'summer', 'autumn'], heightRange: [3, 10], widthRange: [3, 9], preferredBiome: ['woodland-edge', 'garden'], lightPreference: 'part-shade', moisturePreference: 'moist', collisionPolicy: 'trunk' }
	),
	definePlant(
		{ id: 'redbud', displayName: 'Valley Redbud', family: 'Fabaceae', growthHabit: 'multi-stem flowering tree' },
		{ modelId: 'floweringTree', leafShape: 'heart', leafArrangement: 'open vase crown', flowerForm: 'pea-like blossom', bloomCluster: 'flowers along bare branches', colorVariants: ['magenta', 'rose'], season: ['spring', 'summer', 'autumn'], heightRange: [3, 9], widthRange: [3, 9], stemCount: [2, 6], preferredBiome: ['hillside', 'garden'], slopeTolerance: 0.72, collisionPolicy: 'trunk' }
	),
	definePlant(
		{ id: 'olive', displayName: 'Stone Terrace Olive', family: 'Oleaceae', growthHabit: 'gnarled evergreen tree' },
		{ modelId: 'oliveTree', leafShape: 'narrow silver oval', leafArrangement: 'airy twig clusters', season: ['all'], heightRange: [3, 12], widthRange: [3, 11], stemCount: [1, 5], colorVariants: ['silver-green', 'grey-green'], preferredBiome: ['dry-terrace', 'garden'], lightPreference: 'full-sun', moisturePreference: 'dry', slopeTolerance: 0.92, windResponse: 0.62, collisionPolicy: 'trunk', renderCost: 'high' }
	)
]);
