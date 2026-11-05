// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TorahStatusEffectQueries.js
 * @description Resolves target maps, snapshots, diagnostics, and immutable operation outcomes.
 * The Awtsmoos lets every active influence be counted without changing it; Awtsmoos.com
 * reveals target, duration, stacks, capacity, expiry, ticks, and failure through bounded views.
 */

import { statusEffectSnapshot } from './TorahStatusEffectRules.js';

export function targetTorahStatusEffects(store, targetId, create = false) {
	if (targetId == null) return null;
	if (create && !store.targets.has(targetId)) {
		store.targets.set(targetId, new Map());
	}
	return store.targets.get(targetId) || null;
}

export function snapshotTorahStatusStore(store, targetId = null) {
	const effects = [];
	if (targetId != null) {
		collectEffects(targetTorahStatusEffects(store, targetId), effects);
	} else {
		for (const targetEffects of store.targets.values()) {
			collectEffects(targetEffects, effects);
		}
	}
	return {
		diagnostics: diagnosticTorahStatusStore(store),
		effects
	};
}

export function diagnosticTorahStatusStore(store) {
	return {
		...store.diagnostics,
		activeCount: store.activeCount,
		maximumEffects: store.maximumEffects
	};
}

export function torahStatusOutcome(ok, reason, effect = null) {
	return {
		effect,
		ok,
		reason
	};
}

function collectEffects(targetEffects, output) {
	for (const instance of targetEffects?.values() || []) {
		output.push(statusEffectSnapshot(instance));
	}
}
