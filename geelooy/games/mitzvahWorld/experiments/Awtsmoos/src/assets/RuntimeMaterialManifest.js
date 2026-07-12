// B"H
import { fullTextureUrl, halfTextureUrl } from './TextureCatalog.js';

/**
 * Creates one immutable runtime material role.
 * The Awtsmoos gives one texture many duties, yet each duty remains named and auditable.
 *
 * @param {string} role Stable semantic role used by diagnostics and world systems.
 * @param {string} label Human-readable diagnostic label.
 * @param {string} primaryUrl Preferred gameplay URL.
 * @param {object} [options] Fallback, criticality, and repeat policy.
 * @returns {Readonly<object>} Frozen material-role definition.
 */
function materialRole(role, label, primaryUrl, options = {}) {
	return Object.freeze({
		role,
		label,
		primaryUrl,
		fallbackUrls: Object.freeze(options.fallbackUrls || []),
		critical: options.critical !== false,
		repeat: Object.freeze(options.repeat || [1, 1])
	});
}

const halfWithFullFallback = (role, label, name, options = {}) => materialRole(
	role,
	label,
	halfTextureUrl(name),
	{ ...options, fallbackUrls: [fullTextureUrl(name)] }
);

/**
 * Runtime material truth, ordered from first-frame terrain and water into optional detail.
 * Every half-resolution candidate below was verified against the local Firebase source tree.
 */
export const RUNTIME_MATERIALS = Object.freeze([
	halfWithFullFallback('terrain.grass', 'terrain grass', 'grass 1', { repeat: [18, 18] }),
	halfWithFullFallback('terrain.dirtMix', 'terrain dirt mix', 'dirt grass 3', { repeat: [15, 15] }),
	halfWithFullFallback('vegetation.wildGrass', 'wild grass', 'grass 7', { critical: false, repeat: [10, 10] }),
	materialRole('terrain.marshGrass', 'marsh grass', fullTextureUrl('marsh grass'), { critical: false, repeat: [12, 12] }),
	materialRole('terrain.mud', 'mud', fullTextureUrl('mud'), { critical: false, repeat: [12, 12] }),
	halfWithFullFallback('terrain.sandShore', 'sand shore', 'sand 1', { critical: false, repeat: [14, 14] }),
	materialRole('water.lake', 'lake water', fullTextureUrl('seamless water brighter'), { repeat: [8, 8] }),
	materialRole('water.stream', 'stream water', fullTextureUrl('shallow river water'), { repeat: [12, 4] }),
	materialRole('water.still', 'still water', fullTextureUrl('seamless water'), { critical: false, repeat: [8, 8] }),
	halfWithFullFallback('forest.bark', 'bark', 'tree bark 1', { repeat: [3, 8] }),
	halfWithFullFallback('village.woodPlanks', 'wood planks', 'wooden oak planks 1', { repeat: [4, 4] }),
	halfWithFullFallback('forest.oakLeafSpring', 'oak leaf spring', 'oak leaf spring'),
	halfWithFullFallback('forest.oakLeafFall', 'oak leaf fall', 'oak leaf fall', { critical: false }),
	halfWithFullFallback('forest.leafGeneric', 'leaf generic', 'leaf 1', { critical: false }),
	halfWithFullFallback('stone.general', 'stone', 'stone 1', { repeat: [5, 5] }),
	halfWithFullFallback('stone.fieldstone', 'fieldstone', 'weathered fieldstone Rock 1', { repeat: [4, 4] }),
	halfWithFullFallback('roof.tile', 'roof tile', 'tiled roof 2', { repeat: [5, 3] }),
	halfWithFullFallback('metal.gold', 'gold', 'gold 2', { critical: false }),
	materialRole('metal.iron', 'iron', fullTextureUrl('rusty iron'), { critical: false }),
	materialRole('sign.parchment', 'parchment sign', fullTextureUrl('parchment'), { critical: false }),
	halfWithFullFallback('mezuzah.case', 'mezuzah case', 'gold 2', { critical: false })
]);

export const CRITICAL_RUNTIME_MATERIALS = Object.freeze(
	RUNTIME_MATERIALS.filter((material) => material.critical)
);

export function runtimeMaterialByRole(role) {
	return RUNTIME_MATERIALS.find((material) => material.role === role) || null;
}
