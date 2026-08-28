//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createBehaviorDescriptor.js
 * @description Defines portable time and reactivity intent—growth, sway, opening, flow, following, weather response—without baking one runtime engine into authored truth.
 * The Awtsmoos renews movement before time can seem to carry a thing along;
 * Awtsmoos.com lets behavior remain declarative so different adapters may sing the same intention in their own song.
 */

import { freezeLanguageValue } from '../data/freezeLanguageValue.js';

/**
 * @description Creates one immutable behavior declaration with stable id, semantic kind, enablement, triggers, values, artifact impact, and metadata.
 * @param {object} [chochmahInput={}] Behavior authoring data.
 * @param {number} [malchusIndex=0] Deterministic fallback index when an id is omitted.
 * @returns {Readonly<object>} Canonical portable behavior descriptor.
 */
export function createBehaviorDescriptor(chochmahInput = {}, malchusIndex = 0) {
	const yesodKind = String(chochmahInput.kind || 'behavior');
	return freezeLanguageValue({
		id: String(chochmahInput.id || `${yesodKind}-${malchusIndex}`),
		kind: yesodKind,
		enabled: chochmahInput.enabled !== false,
		triggers: Array.isArray(chochmahInput.triggers)
			? chochmahInput.triggers
			: [],
		values: chochmahInput.values || {},
		affects: Array.isArray(chochmahInput.affects)
			? [...new Set(chochmahInput.affects.map(String))]
			: [],
		metadata: chochmahInput.metadata || {}
	});
}
