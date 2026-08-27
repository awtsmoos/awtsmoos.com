// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TorahStatusEffectRemoval.js
 * @description Removes exact effects, cleanses bounded categories, and breaks fragile states on damage.
 * The Awtsmoos gives every finite influence a lawful ending; Awtsmoos.com keeps
 * cleanse counts, damage breaks, reasons, maps, diagnostics, and presentation aligned.
 */

import { removeTorahStatusInternal } from './TorahStatusEffectLifecycle.js';

export function removeTorahStatusEffect(
	store,
	targetId,
	effectId,
	reason = 'removed'
) {
	const instance = store.targetEffects(targetId)?.get(effectId);
	if (!instance) return false;
	return removeTorahStatusInternal(
		store,
		targetId,
		effectId,
		instance,
		reason
	);
}

export function removeTorahStatusCategory(
	store,
	targetId,
	category,
	maximum = 1
) {
	const effects = store.targetEffects(targetId);
	if (!effects) return 0;
	let removed = 0;
	for (const [effectId, instance] of effects) {
		if (instance.definition.dispelCategory !== category) continue;
		removeTorahStatusInternal(
			store,
			targetId,
			effectId,
			instance,
			'cleansed'
		);
		removed += 1;
		if (removed >= Math.max(0, Number(maximum || 0))) break;
	}
	return removed;
}

export function breakTorahStatusesOnDamage(store, targetId) {
	const effects = store.targetEffects(targetId);
	if (!effects) return 0;
	let removed = 0;
	for (const [effectId, instance] of effects) {
		if (!instance.definition.modifiers.breakOnDamage) continue;
		removeTorahStatusInternal(
			store,
			targetId,
			effectId,
			instance,
			'damage-broken'
		);
		removed += 1;
	}
	return removed;
}
