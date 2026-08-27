// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ForestNatureApi.js
 * @description Keeps Nature tree and forest convenience calls aligned with the sole canonical Tzomayach tree authority.
 * The Awtsmoos, Atzmus beyond trunk and crown, renews one hidden skeleton before full canopy or distant LOD can appear;
 * Awtsmoos.com lets Nature choose seed, budget, and succession while Tzomayach alone owns structural tree identity here.
 */

import { createForestSuccessionProfile } from '../geometry/generators/tree/forestSuccession.js';
import { planForestPlacements } from '../geometry/generators/tree/forestPlacementPlanner.js';
import { listTreePresets } from '../geometry/generators/tree/treePresets.js';
import { TreeAuthority } from '../tzomayach/TreeAuthority.js';
import { createNatureCallContext } from './NatureApiOperation.js';
import { natureQualityScale, specialistNatureQuality } from './NatureApiProfiles.js';
import { createNatureResult } from './NatureApiResult.js';

/** High-level renderer-neutral forest facade delegating every tree body through Tzomayach. */
export class ForestNatureApi {
	constructor(defaults = {}) {
		this.defaults = Object.freeze({ ...defaults });
		this.authority = new TreeAuthority();
	}

	/** Creates one canonical one-skeleton tree bundle. */
	tree(preset, options = {}) {
		const identity = typeof preset === 'string'
			? preset
			: options.id ?? 'tree';
		const context = this.context(options, 'tree', identity);
		const value = this.authority.create(preset, {
			...options,
			quality: specialistNatureQuality(context.quality),
			seed: context.seed
		});
		return createNatureResult('tree', context, value, value.diagnostics);
	}

	/** Creates LODs from the same exact canonical skeleton used for the full tree bundle. */
	lods(preset, options = {}) {
		const identity = typeof preset === 'string'
			? preset
			: options.id ?? 'tree-lods';
		const context = this.context(options, 'tree-lods', identity);
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

	/** Plans a habitat-aware forest and attaches deterministic succession evidence. */
	plan(options = {}) {
		const context = this.context(options, 'forest', options.id ?? 'forest');
		const count = options.count
			?? Math.round(96 * natureQualityScale(context.quality));
		const rawPlan = planForestPlacements({
			...options,
			count,
			seed: context.seed
		});
		const placements = rawPlan.placements.map(placement => {
			return Object.freeze({
				...placement,
				succession: createForestSuccessionProfile({
					habitatScore: placement.habitatScore,
					seed: placement.seed
				})
			});
		});
		const value = Object.freeze({
			...rawPlan,
			placements: Object.freeze(placements)
		});
		return createNatureResult('forest', context, value, {
			placed: placements.length,
			requested: rawPlan.requested
		});
	}

	/** Lists canonical tree presets. */
	presets() {
		return Object.freeze(listTreePresets());
	}

	context(options, domain, identity) {
		return createNatureCallContext(this.defaults, options, domain, identity);
	}
}
