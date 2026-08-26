// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VegetationNatureClusterApi.js
 * @description Gives common botanical intentions named individual and cluster doors over the canonical deterministic patch planner.
 * The Awtsmoos renews shrub, tuft, reed, fern, and groundcover before any garden groups their finite forms;
 * Awtsmoos.com lets one honest species become one plant or a seeded living colony while expert distribution still transforms.
 */

import { VegetationNatureFoundationApi } from './VegetationNatureFoundationApi.js';

/** Adds professional botanical intent names without duplicating Tzomayach generation law. */
export class VegetationNatureClusterApi extends VegetationNatureFoundationApi {
	/** Creates one shrub organism from any canonical shrub species. */
	bush(species = 'rose-bush', options = {}) {
		return this.plant(species, options);
	}

	/** Creates a deterministic shrub colony with understory placement by default. */
	bushCluster(species = 'rose-bush', options = {}) {
		return this.plantCluster(species, clusterOptions(options, {
			count: 18,
			distribution: 'understory',
			radius: 4.5
		}));
	}

	/** Creates one ornamental or meadow grass organism rather than a large ecosystem grass field. */
	grassTuft(species = 'maiden-grass', options = {}) {
		return this.plant(species, options);
	}

	/** Creates a deterministic tuft cluster suitable for visible meadow clumps and garden beds. */
	grassCluster(species = 'maiden-grass', options = {}) {
		return this.plantCluster(species, clusterOptions(options, {
			count: 32,
			distribution: 'meadow',
			radius: 5
		}));
	}

	/** Creates one feather-reed grass organism for waterside or architectural planting. */
	reed(species = 'feather-reed-grass', options = {}) {
		return this.plant(species, options);
	}

	/** Creates a deterministic band of reed-like grasses without pretending they are a different species. */
	reedCluster(species = 'feather-reed-grass', options = {}) {
		return this.plantCluster(species, clusterOptions(options, {
			count: 28,
			distribution: 'band',
			radius: 5.5
		}));
	}

	/** Creates one canonical carpet-form groundcover organism. */
	groundcover(species = 'creeping-thyme', options = {}) {
		return this.plant(species, options);
	}

	/** Creates a dense deterministic groundcover carpet. */
	groundcoverCluster(species = 'creeping-thyme', options = {}) {
		return this.plantCluster(species, clusterOptions(options, {
			count: 48,
			distribution: 'meadow',
			radius: 3.8
		}));
	}

	/** Creates one fern for woodland and shaded scenes. */
	fern(species = 'maidenhair-fern', options = {}) {
		return this.plant(species, options);
	}

	/** Creates an understory fern colony with deterministic spacing. */
	fernCluster(species = 'maidenhair-fern', options = {}) {
		return this.plantCluster(species, clusterOptions(options, {
			count: 22,
			distribution: 'understory',
			radius: 4
		}));
	}
}

/** Applies ergonomic defaults while preserving every explicit expert cluster field. */
function clusterOptions(options, defaults) {
	return {
		...defaults,
		...options
	};
}
