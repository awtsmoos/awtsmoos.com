// B"H
// Boruch Hashem
// Blessed is He
import { definePlant } from './schema.js';

/** Foliage identities distinguish fans, fronds, vines, mats, and grass fountains. */
export const FOLIAGE_PLANTS = Object.freeze([
	definePlant(
		{ id: 'hosta', displayName: 'Shade Hosta', family: 'Asparagaceae', growthHabit: 'basal leaf mound' },
		{ modelId: 'hostaClump', leafShape: 'broad ribbed heart', leafArrangement: 'basal rosette', flowerForm: 'pendent bells', bloomCluster: 'slender raceme', colorVariants: ['blue-green', 'variegated'], heightRange: [0.28, 0.75], widthRange: [0.45, 1.2], lightPreference: 'shade', moisturePreference: 'moist', windResponse: 0.42 }
	),
	definePlant(
		{ id: 'fern', displayName: 'Valley Fern', family: 'Dryopteridaceae', growthHabit: 'arching frond crown' },
		{ modelId: 'fernClump', leafShape: 'pinnate frond', leafArrangement: 'fiddlehead crown', colorVariants: ['emerald', 'deep-green'], season: ['spring', 'summer', 'autumn'], heightRange: [0.35, 1.2], widthRange: [0.5, 1.5], stemCount: [7, 22], preferredBiome: ['woodland', 'streamside'], lightPreference: 'shade', moisturePreference: 'moist', windResponse: 0.66 }
	),
	definePlant(
		{ id: 'ivy', displayName: 'Stonewall Ivy', family: 'Araliaceae', growthHabit: 'clinging evergreen vine' },
		{ modelId: 'climbingVine', leafShape: 'three-lobed', leafArrangement: 'alternate vine', season: ['all'], heightRange: [0.2, 5], widthRange: [0.3, 3], stemCount: [4, 28], preferredBiome: ['wall', 'woodland'], lightPreference: 'shade', slopeTolerance: 1, placementDensity: 0.8, collisionPolicy: 'none' }
	),
	definePlant(
		{ id: 'moss', displayName: 'Wet Stone Moss', family: 'Bryophyte community', growthHabit: 'cushion mat' },
		{ modelId: 'groundCover', leafShape: 'minute scale', leafArrangement: 'dense mat', colorVariants: ['emerald', 'yellow-green'], season: ['all'], heightRange: [0.01, 0.08], widthRange: [0.2, 2.2], stemCount: [40, 180], preferredBiome: ['wet-rock', 'streamside', 'woodland'], lightPreference: 'shade', moisturePreference: 'wet', slopeTolerance: 1, placementDensity: 0.96, windResponse: 0.03, renderCost: 'low' }
	),
	definePlant(
		{ id: 'ajuga', displayName: 'Garden Ajuga', family: 'Lamiaceae', growthHabit: 'creeping ground cover' },
		{ modelId: 'groundCover', flowerForm: 'small blue tubes', bloomCluster: 'short upright spikes', leafShape: 'spoon bronze', colorVariants: ['blue', 'violet'], heightRange: [0.08, 0.28], widthRange: [0.25, 1], stemCount: [12, 55], lightPreference: 'part-shade', moisturePreference: 'moderate', placementDensity: 0.9 }
	),
	definePlant(
		{ id: 'ornamentalGrass', displayName: 'Golden Fountain Grass', family: 'Poaceae', growthHabit: 'arching grass fountain' },
		{ modelId: 'grassClump', flowerForm: 'bristled seed plume', bloomCluster: 'arching panicles', leafShape: 'narrow blade', leafArrangement: 'basal fountain', colorVariants: ['gold', 'green'], season: ['summer', 'autumn'], heightRange: [0.55, 1.5], widthRange: [0.5, 1.4], stemCount: [24, 80], lightPreference: 'full-sun', moisturePreference: 'dry', windResponse: 0.92 }
	),
	definePlant(
		{ id: 'streamsideSedge', displayName: 'Streamside Sedge', family: 'Cyperaceae', growthHabit: 'upright wetland clump' },
		{ modelId: 'grassClump', flowerForm: 'small brown spikelets', bloomCluster: 'terminal sedge heads', leafShape: 'triangular blade', leafArrangement: 'basal clump', colorVariants: ['fresh-green', 'blue-green'], heightRange: [0.45, 1.3], widthRange: [0.35, 0.9], stemCount: [18, 65], preferredBiome: ['streamside', 'wetland'], moisturePreference: 'wet', windResponse: 0.84 }
	),
	definePlant(
		{ id: 'heuchera', displayName: 'Coral Bell Foliage', family: 'Saxifragaceae', growthHabit: 'compact leaf mound' },
		{ modelId: 'hostaClump', flowerForm: 'tiny bells', bloomCluster: 'airy panicles', leafShape: 'lobed round', colorVariants: ['burgundy', 'lime', 'bronze'], heightRange: [0.2, 0.65], widthRange: [0.35, 0.75], lightPreference: 'part-shade', windResponse: 0.5 }
	),
	definePlant(
		{ id: 'woodlandGroundCover', displayName: 'Woodland Ground Mosaic', family: 'mixed woodland community', growthHabit: 'layered low colony' },
		{ modelId: 'groundCover', leafShape: 'mixed heart and divided leaves', leafArrangement: 'overlapping carpet', colorVariants: ['deep-green', 'silver-green'], season: ['spring', 'summer', 'autumn'], heightRange: [0.06, 0.32], widthRange: [0.7, 2.5], stemCount: [25, 110], preferredBiome: ['woodland'], lightPreference: 'shade', moisturePreference: 'moist', placementDensity: 0.94 }
	)
]);
