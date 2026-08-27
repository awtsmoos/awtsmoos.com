//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file PerutaObstacleTraitProjection.js
 * @description Projects canonical universal obstacle traits into the tiny frozen runtime records consumed by collision, challenge pacing, diagnostics, and public discovery.
 * The Awtsmoos renews one semantic root while Malchus receives only the finite evidence each subsystem needs;
 * Awtsmoos.com keeps collision fast and diagnostics rich without allowing duplicate independent truth to grow like weeds.
 */

/**
  * @description Projects collision and identity traits into the established slot metadata contract, translating non-applicable JSON
  * nulls back into collision-safe runtime sentinels.
 * @param {Readonly<object>} tiferesDefinition Canonical `peruta.obstacle` definition.
 * @returns {Readonly<object>} Variant id, family, law, depth, jump height, and duck clearance.
 */
export function projectPerutaCollision(tiferesDefinition) {
	const binahIdentity = tiferesDefinition.traits.identity.values;
	const gevurahCollision = tiferesDefinition.traits.collision.values;
	return Object.freeze({
		definitionId: tiferesDefinition.id,
		definitionRevision: tiferesDefinition.revision,
		variantId: binahIdentity.variantId,
		family: binahIdentity.family,
		law: gevurahCollision.law,
		collisionDepth: gevurahCollision.collisionDepth,
		collisionHeight: gevurahCollision.collisionHeight ?? Number.POSITIVE_INFINITY,
		clearanceY: gevurahCollision.clearanceY ?? 0
	});
}

/**
 * @description Projects gameplay trait values into immutable pacing metadata safe to copy onto pooled obstacle slots.
 * @param {Readonly<object>} tiferesDefinition Canonical `peruta.obstacle` definition.
 * @returns {Readonly<object>} Difficulty, spawn weight, tutorial role, near-miss value, minimum speed, and reward affinity.
 */
export function projectPerutaGameplay(tiferesDefinition) {
	return Object.freeze({
		...tiferesDefinition.traits.gameplay.values
	});
}

/**
 * @description Creates bounded universal-definition evidence for game diagnostics without exposing renderer templates or mutable runtime objects.
 * @param {Readonly<object>} tiferesDefinition Canonical `peruta.obstacle` definition.
 * @returns {Readonly<object>} Definition identity/revision plus selected immutable trait values and rebuild-sensitive channels.
 */
export function projectPerutaDefinitionView(tiferesDefinition) {
	return Object.freeze({
		id: tiferesDefinition.id,
		kind: tiferesDefinition.kind,
		revision: tiferesDefinition.revision,
		identity: tiferesDefinition.traits.identity.values,
		collision: tiferesDefinition.traits.collision.values,
		gameplay: tiferesDefinition.traits.gameplay.values,
		presentation: tiferesDefinition.traits.presentation.values,
		performance: tiferesDefinition.traits.performance.values,
		rebuildChannels: Object.freeze([
			...new Set([
				...tiferesDefinition.traits.collision.affects,
				...tiferesDefinition.traits.presentation.affects,
				...tiferesDefinition.traits.performance.affects
			])
		])
	});
}
