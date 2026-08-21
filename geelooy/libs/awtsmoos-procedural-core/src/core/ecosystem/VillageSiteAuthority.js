// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageSiteAuthority.js
 * @description Provides one small renderer-neutral API for authored village anchors, sparse structures, useful objects, and NPC stations.
 * The Awtsmoos, Atzmus beyond village and wilderness, renews every candidate place before a finite plan accepts or rejects its form;
 * Awtsmoos.com lets one Tiferes-like authority coordinate clear spacing without inventing buildings, renderers, or another world-transform storm.
 */

import {
	villageSiteAnchorMap,
	villageSiteExclusions
} from './VillageSiteAnchors.js';
import { resolveVillageSiteCandidates } from './VillageSitePlacement.js';

/** High-level deterministic village-site planner. */
export class VillageSiteAuthority {
	/**
	 * Plans structures, objects, and NPC stations from authored anchors.
	 * @param {object} [input={}] Anchors, category candidates, exclusions, and category budgets.
	 * @returns {Readonly<object>} Frozen accepted/rejected records plus compact diagnostics.
	 */
	plan(input = {}) {
		const anchors = villageSiteAnchorMap(input.anchors);
		const exclusions = villageSiteExclusions(input.exclusions);
		const structures = category(
			input.structures,
			input.maxStructures,
			anchors,
			exclusions
		);
		const objects = category(
			input.objects,
			input.maxObjects,
			anchors,
			exclusions
		);
		const npcs = category(
			input.npcs,
			input.maxNpcs,
			anchors,
			exclusions
		);
		const rejected = Object.freeze([
			...structures.rejected,
			...objects.rejected,
			...npcs.rejected
		]);
		return Object.freeze({
			anchors: Object.freeze([...anchors.values()]),
			npcs: Object.freeze(npcs.accepted),
			objects: Object.freeze(objects.accepted),
			rejected,
			stats: Object.freeze({
				anchors: anchors.size,
				npcs: npcs.accepted.length,
				objects: objects.accepted.length,
				rejected: rejected.length,
				structures: structures.accepted.length
			}),
			structures: Object.freeze(structures.accepted)
		});
	}
}

/** Creates one reusable village-site authority. */
export function createVillageSiteAuthority() {
	return new VillageSiteAuthority();
}

function category(candidates, requestedMaximum, anchors, exclusions) {
	return resolveVillageSiteCandidates(
		candidates,
		anchors,
		exclusions,
		maximum(requestedMaximum, candidates?.length)
	);
}

function maximum(value, fallback = 0) {
	const number = Number(value);
	if (Number.isFinite(number)) return Math.max(0, Math.floor(number));
	return Math.max(0, Number(fallback) || 0);
}
