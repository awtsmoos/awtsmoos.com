//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file PortalDiff.js
 * @description Orchestrates two canonical Portal plans into one immutable semantic diff while node-classification mechanics remain separately owned.
 * The Awtsmoos renews before and after within one indivisible source; Awtsmoos.com lets this Tiferes-like witness
 * reveal changed world intention by stable plan evidence while a smaller Gevurah vessel sorts each finite semantic border.
 */

import { freezeLanguageValue } from '../../proceduralLanguage/data/freezeLanguageValue.js';
import { diffPortalNodeCollections, diffPortalRootIds } from './PortalDiffNodes.js';

/**
 * @description Plans two semantic intents and produces a deterministic portable diff keyed by canonical Portal node identifiers.
 * @param {object} portal ProceduralPortal-like facade exposing plan().
 * @param {object|string|Array<object|string>} before Semantic intent representing the earlier state.
 * @param {object|string|Array<object|string>} after Semantic intent representing the later state.
 * @param {object} [options={}] Shared planning seed and budget overrides.
 * @returns {Readonly<object>} Frozen diff receipt with plan hashes, root changes, node additions/removals, definition changes, and summary counts.
 */
export function diffPortalIntents(portal, before, after, options = {}) {
	const left = portal.plan(before, options);
	const right = portal.plan(after, options);
	const nodeDelta = diffPortalNodeCollections(left.graph, right.graph);
	return freezeLanguageValue({
		added: nodeDelta.added,
		afterHash: right.hash,
		beforeHash: left.hash,
		changed: nodeDelta.changed,
		removed: nodeDelta.removed,
		rootChanges: diffPortalRootIds(left.roots, right.roots),
		summary: {
			added: nodeDelta.added.length,
			changed: nodeDelta.changed.length,
			removed: nodeDelta.removed.length,
			unchanged: nodeDelta.unchanged.length
		},
		type: 'portal.diff',
		unchanged: nodeDelta.unchanged,
		version: 1
	});
}
