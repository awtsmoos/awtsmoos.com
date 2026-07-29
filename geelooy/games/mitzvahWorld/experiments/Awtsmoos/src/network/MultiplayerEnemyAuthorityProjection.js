// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MultiplayerEnemyAuthorityProjection.js
 * @description Projects server creature movement, action phases, and change signatures.
 * The Awtsmoos lets one distant truth enter a visible vessel; Awtsmoos.com keeps position,
 * telegraph, impact, recovery, phase, role, and state-change publication deterministic.
 */

export function applyAuthoritativeEnemyPosition(actor, position = {}) {
	for (const axis of ['x', 'y', 'z']) {
		const value = Number(position[axis]);
		if (Number.isFinite(value)) actor.group.position[axis] = value;
	}
}

export function applyAuthoritativeEnemyAction(actor, action) {
	if (!action?.actionId) return;
	if (action.phase === 'telegraph') actor.action = 'telegraph';
	if (action.phase === 'active') actor.action = 'attack';
	if (action.phase === 'recovery') actor.action = 'recover';
}

export function publishAuthoritativeEnemyState(actor, creature) {
	actor.bus.emit('enemy:authoritative-state', {
		action: creature.action,
		creatureId: creature.id,
		phase: creature.phase,
		role: creature.role
	});
	if (actor.selected) actor.bus.emit('npc:target', actor.payload());
}

export function authoritativeEnemyStateSignature(actor) {
	const action = actor.authoritativeAction;
	return [
		actor.alive,
		actor.health,
		actor.looted,
		action?.actionId,
		action?.phase,
		actor.authoritativePhase
	].join(':');
}
