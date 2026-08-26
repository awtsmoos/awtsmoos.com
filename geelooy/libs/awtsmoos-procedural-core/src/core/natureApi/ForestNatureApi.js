// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ForestNatureApi.js
 * @description Reveals one-skeleton trees, biology, LODs, controls, and succession forests through canonical Tzomayach authority.
 * The Awtsmoos renews hidden branch identity before root, bark, crown, wind, season, or polygon can appear;
 * Awtsmoos.com lets beginners grow a tree while expert skeleton and biology doors remain discoverable without dividing the source here.
 */

import { createForestSuccessionProfile } from '../geometry/generators/tree/forestSuccession.js';
import { planForestPlacements } from '../geometry/generators/tree/forestPlacementPlanner.js';
import { listTreePresets } from '../geometry/generators/tree/treePresets.js';
import { TreeAuthority } from '../tzomayach/TreeAuthority.js';
import { createNatureCallContext } from './NatureApiOperation.js';
import { natureQualityScale, specialistNatureQuality } from './NatureApiProfiles.js';
import { createNatureResult } from './NatureApiResult.js';
import { describeTreeNatureControls } from './TreeNatureDiscovery.js';

/** Professional forest facade preserving one canonical Tzomayach structural authority. */
export class ForestNatureApi {
	constructor(defaults = {}) {
		this.defaults = Object.freeze({ ...defaults });
		this.authority = new TreeAuthority();
	}

	/** Creates one full tree bundle whose anatomy, geometry, LODs, and living state share one skeleton. */
	tree(preset = 'Oak Medium', options = {}) {
		const context = this.context(options, 'tree', identityOf(preset, options, 'tree'));
		const value = this.authority.create(preset, {
			...options,
			quality: specialistNatureQuality(context.quality),
			seed: context.seed
		});
		return createNatureResult('tree', context, value, value.diagnostics);
	}

	/** Creates only the canonical semantic skeleton for expert inspection or custom renderers. */
	skeleton(preset = 'Oak Medium', options = {}) {
		const context = this.context(options, 'tree-skeleton', identityOf(preset, options, 'tree-skeleton'));
		const value = this.authority.skeleton(preset, {
			...options,
			seed: context.seed
		});
		return createNatureResult('tree-skeleton', context, value, {
			contentHash: value.contentHash,
			preset: value.preset
		});
	}

	/** Creates derived roots, reproduction, deadwood, seasonal, and environmental biology for one skeleton. */
	biology(skeletonKli, options = {}) {
		return this.authority.biology(skeletonKli, options);
	}

	/** Creates LODs from the exact canonical skeleton used for full tree geometry. */
	lods(preset = 'Oak Medium', options = {}) {
		const context = this.context(options, 'tree-lods', identityOf(preset, options, 'tree-lods'));
		const bundle = this.authority.create(preset, {
			...options,
			quality: specialistNatureQuality(context.quality),
			seed: context.seed
		});
		return createNatureResult('tree-lods', context, bundle.lods, {
			lodCount: bundle.lods.length,
			skeletonHash: bundle.skeleton.contentHash
		});
	}

	/** Plans a habitat-aware forest and deterministic succession evidence. */
	plan(options = {}) {
		const context = this.context(options, 'forest', options.id ?? 'forest');
		const count = options.count ?? Math.round(96 * natureQualityScale(context.quality));
		const rawPlan = planForestPlacements({ ...options, count, seed: context.seed });
		const placements = rawPlan.placements.map(placement => Object.freeze({
			...placement,
			succession: createForestSuccessionProfile({
				habitatScore: placement.habitatScore,
				seed: placement.seed
			})
		}));
		const value = Object.freeze({ ...rawPlan, placements: Object.freeze(placements) });
		return createNatureResult('forest', context, value, {
			placed: placements.length,
			requested: rawPlan.requested
		});
	}

	/** Lists all canonical discovered tree presets. */
	presets() {
		return Object.freeze(listTreePresets());
	}

	/** Describes verified branch, bark, leaf, biology, LOD, and shared-skeleton controls. */
	controls() {
		return describeTreeNatureControls();
	}

	context(options, domain, identity) {
		return createNatureCallContext(this.defaults, options, domain, identity);
	}
}

function identityOf(preset, options, fallback) {
	return typeof preset === 'string' ? preset : options.id ?? fallback;
}
