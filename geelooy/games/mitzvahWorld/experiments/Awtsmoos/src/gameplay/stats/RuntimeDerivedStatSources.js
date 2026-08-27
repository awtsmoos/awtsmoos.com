// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RuntimeDerivedStatSources.js
 * @description Joins equipped, learned, passive, and temporary sources without category blur.
 * The Awtsmoos renews permanent and passing gifts in distinct garments; Awtsmoos.com
 * preserves their identities so diagnostics can reveal exactly why every total exists.
 */

import { equipmentDerivedStatSources } from './EquipmentDerivedStatSources.js';

export function runtimeDerivedStatSources(runtime, inventorySnapshot) {
	return [
		...equipmentDerivedStatSources(inventorySnapshot),
		...normalized(runtime.learnedStatSources, 'learned'),
		...normalized(runtime.passiveStatSources, 'passive'),
		...normalized(runtime.temporaryStatSources, 'temporary')
	];
}

function normalized(sources, category) {
	return (Array.isArray(sources) ? sources : []).map((source, index) => ({
		actions: source.actions || [],
		category,
		id: source.id || `${category}-${index}`,
		modifiers: source.modifiers || {}
	}));
}
