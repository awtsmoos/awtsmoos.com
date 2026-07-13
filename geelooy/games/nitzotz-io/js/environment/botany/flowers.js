// B"H
// Boruch Hashem
// Blessed is He
import { definePlant } from './schema.js';

/** Recognizable flowering identities share morphology families without sharing names. */
export const FLOWERING_PLANTS = Object.freeze([
	definePlant(
		{ id: 'daisy', displayName: 'Mountain Daisy', family: 'Asteraceae', growthHabit: 'clumping perennial' },
		{ modelId: 'compositeFlower', flowerForm: 'ray petals around disk', bloomCluster: 'solitary heads', leafShape: 'spatulate', colorVariants: ['white-yellow', 'cream-gold'], heightRange: [0.18, 0.42], widthRange: [0.18, 0.38], preferredBiome: ['meadow', 'garden'], placementDensity: 0.82 }
	),
	definePlant(
		{ id: 'iris', displayName: 'River Iris', family: 'Iridaceae', growthHabit: 'rhizomatous fan' },
		{ modelId: 'irisClump', flowerForm: 'upright standards and falls', bloomCluster: 'branched stems', leafShape: 'sword', leafArrangement: 'basal fan', colorVariants: ['violet-gold', 'blue-white'], heightRange: [0.55, 1.05], moisturePreference: 'moist', preferredBiome: ['streamside', 'garden'] }
	),
	definePlant(
		{ id: 'geranium', displayName: 'Terrace Geranium', family: 'Geraniaceae', growthHabit: 'mounded bedding plant' },
		{ modelId: 'beddingFlower', flowerForm: 'five rounded petals', bloomCluster: 'rounded umbels', leafShape: 'palmate', colorVariants: ['crimson', 'rose', 'white'], heightRange: [0.22, 0.55], widthRange: [0.3, 0.65], placementDensity: 0.76 }
	),
	definePlant(
		{ id: 'petunia', displayName: 'Market Petunia', family: 'Solanaceae', growthHabit: 'trailing mound' },
		{ modelId: 'beddingFlower', flowerForm: 'funnel trumpet', bloomCluster: 'scattered canopy', leafShape: 'ovate', colorVariants: ['violet', 'pink', 'white'], heightRange: [0.18, 0.4], widthRange: [0.35, 0.8], windResponse: 0.62 }
	),
	definePlant(
		{ id: 'phlox', displayName: 'Valley Phlox', family: 'Polemoniaceae', growthHabit: 'upright colony' },
		{ modelId: 'beddingFlower', flowerForm: 'five-lobed salver', bloomCluster: 'domed panicle', leafShape: 'lanceolate', colorVariants: ['magenta', 'lavender', 'white'], heightRange: [0.35, 0.95], stemCount: [6, 18], preferredBiome: ['garden', 'meadow'] }
	),
	definePlant(
		{ id: 'rose', displayName: 'Courtyard Rose', family: 'Rosaceae', growthHabit: 'thorny shrub' },
		{ modelId: 'roseBush', flowerForm: 'layered rosette', bloomCluster: 'solitary and corymb', leafShape: 'serrated compound', colorVariants: ['crimson', 'blush', 'cream'], heightRange: [0.6, 1.6], widthRange: [0.55, 1.45], collisionPolicy: 'soft', renderCost: 'high' }
	),
	definePlant(
		{ id: 'climbingRose', displayName: 'Lantern Climbing Rose', family: 'Rosaceae', growthHabit: 'climbing vine' },
		{ modelId: 'climbingVine', flowerForm: 'layered rosette', bloomCluster: 'arching clusters', leafShape: 'serrated compound', colorVariants: ['rose', 'apricot', 'white'], heightRange: [1.2, 4.5], widthRange: [0.5, 2.4], preferredBiome: ['wall', 'garden'], slopeTolerance: 0.8, collisionPolicy: 'none' }
	),
	definePlant(
		{ id: 'foxglove', displayName: 'Woodland Foxglove', family: 'Plantaginaceae', growthHabit: 'tall biennial spike' },
		{ modelId: 'flowerSpike', flowerForm: 'pendent tubular bells', bloomCluster: 'one-sided raceme', leafShape: 'downy lanceolate', leafArrangement: 'basal rosette', colorVariants: ['purple-speckled', 'pink', 'cream'], heightRange: [0.9, 1.9], windResponse: 0.72, preferredBiome: ['woodland-edge', 'garden'] }
	),
	definePlant(
		{ id: 'lavender', displayName: 'Stonepath Lavender', family: 'Lamiaceae', growthHabit: 'woody aromatic mound' },
		{ modelId: 'flowerSpike', flowerForm: 'small bilabiate florets', bloomCluster: 'slender spikes', leafShape: 'linear silver', colorVariants: ['violet', 'blue-violet'], heightRange: [0.35, 0.85], moisturePreference: 'dry', lightPreference: 'full-sun', slopeTolerance: 0.85, windResponse: 0.7 }
	),
	definePlant(
		{ id: 'salvia', displayName: 'Garden Salvia', family: 'Lamiaceae', growthHabit: 'upright perennial' },
		{ modelId: 'flowerSpike', flowerForm: 'hooded florets', bloomCluster: 'dense spikes', leafShape: 'ovate serrated', colorVariants: ['indigo', 'scarlet', 'violet'], heightRange: [0.45, 1.25], stemCount: [5, 16], preferredBiome: ['garden', 'meadow'] }
	),
	definePlant(
		{ id: 'meadowFlowers', displayName: 'Highland Meadow Mix', family: 'mixed forb community', growthHabit: 'mixed flowering colony' },
		{ modelId: 'meadowCluster', flowerForm: 'mixed disks, cups, and stars', bloomCluster: 'scattered mosaic', leafShape: 'mixed fine foliage', colorVariants: ['gold-blue-white', 'pink-purple-white'], heightRange: [0.15, 0.75], widthRange: [0.8, 2.8], stemCount: [18, 70], preferredBiome: ['meadow'], placementDensity: 0.95, renderCost: 'medium' }
	),
	definePlant(
		{ id: 'woodlandAnemone', displayName: 'Woodland Anemone', family: 'Ranunculaceae', growthHabit: 'rhizomatous ground colony' },
		{ modelId: 'compositeFlower', flowerForm: 'open star cup', bloomCluster: 'solitary stems', leafShape: 'deeply divided', colorVariants: ['white-gold', 'pale-pink'], heightRange: [0.12, 0.3], widthRange: [0.25, 0.8], preferredBiome: ['woodland'], lightPreference: 'shade', moisturePreference: 'moist' }
	)
]);
