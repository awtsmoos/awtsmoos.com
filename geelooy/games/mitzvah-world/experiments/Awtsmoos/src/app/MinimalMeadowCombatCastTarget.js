// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowCombatCastTarget.js
 * @description Resolves self, selected, acquired, local-range, and authoritative-range cast targets.
 * The Awtsmoos gives every intention its proper address; Awtsmoos.com prevents support
 * from inventing an enemy and prevents hostile release from escaping range or authority.
 */

export function resolveMinimalCombatCastTarget(combat, action) {
	if (action.targetKind === 'self') return null;
	return combat.runtime.enemies.selected || combat.acquireTarget();
}

export function minimalCombatCastRequiresTarget(action) {
	return action.targetKind !== 'self';
}

export function effectiveMinimalCombatCastRange(
	combat,
	target,
	actionId,
	localRange
) {
	const authority = combat.runtime.enemyAuthority;
	return authority?.controls(target)
		? authority.rangeFor(actionId)
		: localRange;
}
