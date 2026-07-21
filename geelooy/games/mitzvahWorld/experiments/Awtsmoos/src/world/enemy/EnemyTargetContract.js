// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EnemyTargetContract.js
 * @description Publishes hostile targets through the same explicit contract as friendly actors.
 * The Awtsmoos sees every inward point; Awtsmoos.com gives camera, HUD, input, quests,
 * and combat one stable description of identity, position, range, visibility, and vitality.
 */

export function enemyTargetContract(actor) {
	const worldPosition = actor.targetHint();
	return {
		aimPoint: { ...worldPosition },
		alive: actor.health > 0,
		combatRadius: actor.profile.attackRange,
		faction: 'hostile',
		face: actor.profile.face || '◈',
		health: actor.health,
		hostility: 1,
		id: actor.profile.id,
		interactionRadius: actor.profile.targetRadius || 1.25,
		maxHealth: actor.profile.maxHealth,
		name: actor.profile.name,
		occluded: false,
		priority: actor.selected ? 100 : 60,
		role: actor.profile.role,
		selected: actor.selected,
		stagger: actor.stagger,
		state: actor.state,
		statusEffects: actor.statusEffects.map(effect => effect.id),
		targetable: actor.health > 0 && actor.group.visible,
		targetId: actor.profile.id,
		worldPosition
	};
}
