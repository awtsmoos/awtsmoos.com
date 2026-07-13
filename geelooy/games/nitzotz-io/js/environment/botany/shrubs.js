// B"H
// Boruch Hashem
// Blessed is He
import { definePlant } from './schema.js';

/** Shrubs provide distinct mound, panicle, clipped, and aromatic silhouettes. */
export const SHRUB_PLANTS = Object.freeze([
	definePlant(
		{ id: 'hydrangea', displayName: 'Canal Hydrangea', family: 'Hydrangeaceae', growthHabit: 'rounded deciduous shrub' },
		{ modelId: 'panicleShrub', flowerForm: 'four-sepal florets', bloomCluster: 'large mopheads', leafShape: 'broad serrated', colorVariants: ['blue', 'pink', 'white'], heightRange: [0.8, 1.8], widthRange: [0.9, 2.1], moisturePreference: 'moist', lightPreference: 'part-shade', renderCost: 'high' }
	),
	definePlant(
		{ id: 'viburnum', displayName: 'Valley Viburnum', family: 'Adoxaceae', growthHabit: 'branching deciduous shrub' },
		{ modelId: 'panicleShrub', flowerForm: 'small five-petal florets', bloomCluster: 'flat corymbs', leafShape: 'ovate veined', colorVariants: ['white', 'cream'], heightRange: [1, 2.6], widthRange: [1, 2.8], preferredBiome: ['garden', 'woodland-edge'], collisionPolicy: 'soft' }
	),
	definePlant(
		{ id: 'lilac', displayName: 'Hillside Lilac', family: 'Oleaceae', growthHabit: 'multi-stem flowering shrub' },
		{ modelId: 'panicleShrub', flowerForm: 'small tubular stars', bloomCluster: 'conical panicles', leafShape: 'heart', colorVariants: ['lilac', 'white', 'deep-purple'], heightRange: [1.4, 3.6], widthRange: [1.1, 3], lightPreference: 'full-sun', collisionPolicy: 'soft' }
	),
	definePlant(
		{ id: 'boxwood', displayName: 'Terrace Boxwood', family: 'Buxaceae', growthHabit: 'dense evergreen shrub' },
		{ modelId: 'clippedShrub', leafShape: 'small oval', leafArrangement: 'opposite', heightRange: [0.35, 1.5], widthRange: [0.35, 1.4], stemCount: [12, 40], flowerForm: 'inconspicuous', colorVariants: ['deep-green', 'olive-green'], season: ['all'], placementDensity: 0.72, windResponse: 0.18, renderCost: 'low' }
	),
	definePlant(
		{ id: 'rosemary', displayName: 'Wall Rosemary', family: 'Lamiaceae', growthHabit: 'woody aromatic shrub' },
		{ modelId: 'herbMound', flowerForm: 'small bilabiate florets', bloomCluster: 'axillary clusters', leafShape: 'needle-linear', colorVariants: ['blue', 'pale-violet'], heightRange: [0.35, 1.1], widthRange: [0.45, 1.3], moisturePreference: 'dry', lightPreference: 'full-sun', slopeTolerance: 0.95 }
	),
	definePlant(
		{ id: 'thyme', displayName: 'Creeping Thyme', family: 'Lamiaceae', growthHabit: 'creeping aromatic mat' },
		{ modelId: 'groundCover', flowerForm: 'tiny bilabiate florets', bloomCluster: 'dense low carpet', leafShape: 'minute oval', colorVariants: ['pink', 'lavender'], heightRange: [0.04, 0.18], widthRange: [0.25, 1.2], stemCount: [16, 70], moisturePreference: 'dry', slopeTolerance: 1, placementDensity: 0.92, renderCost: 'low' }
	),
	definePlant(
		{ id: 'sage', displayName: 'Silver Garden Sage', family: 'Lamiaceae', growthHabit: 'woody herb mound' },
		{ modelId: 'herbMound', flowerForm: 'bilabiate florets', bloomCluster: 'short whorled spikes', leafShape: 'oblong woolly', colorVariants: ['violet', 'blue'], heightRange: [0.3, 0.85], widthRange: [0.4, 1], moisturePreference: 'dry', lightPreference: 'full-sun', slopeTolerance: 0.88, windResponse: 0.38 }
	)
]);
