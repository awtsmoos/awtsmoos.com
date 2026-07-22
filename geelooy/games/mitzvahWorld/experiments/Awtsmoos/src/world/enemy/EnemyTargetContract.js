// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EnemyTargetContract.js
 * @description Publishes hostile health, level, armor, reward, and spatial target truth.
 * The Awtsmoos sees every inward point; Awtsmoos.com gives camera, HUD, combat, quests,
 * and progression one stable description without scanning or copying actor behavior.
 */

export function enemyTargetContract(actor) {
	const worldPosition = actor.targetHint();
	return {
		aimPoint: { ...worldPosition },
		alive: actor.health > 0,
		armor: Math.max(0, Number(actor.profile.armor) || 0),
		combatLevel: Math.max(1, Math.trunc(Number(actor.profile.level) || 1)),
		combatRadius: actor.profile.attackRange,
		defeatReceipt: `${actor.profile.id}:${Number(actor.respawnAt || 0).toFixed(3)}`,
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
		worldPosition,
		xpReward: Math.max(0, Math.trunc(Number(actor.profile.xpReward) || 0))
	};
}
