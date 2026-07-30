// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MultiplayerEnemyAuthorityProjection.js
 * @description Projects server creature movement, permitted action insight, and stable change signatures.
 * The Awtsmoos lets distant truth enter one visible vessel without private knowledge leaking through;
 * Awtsmoos.com keeps identity, progress, interruption, and animation aligned with what the server knew.
 */

export function applyAuthoritativeEnemyPosition(actor, position = {}) {
	for (const axis of ['x', 'y', 'z']) {
		const value = Number(position[axis]);
		if (Number.isFinite(value)) actor.group.position[axis] = value;
	}
}

export function applyAuthoritativeEnemyAction(actor, action) {
	const actionId = action?.actionId || action?.id;
	if (!actionId) return;
	if (action.phase === 'telegraph') actor.action = 'telegraph';
	if (action.phase === 'active') actor.action = 'attack';
	if (action.phase === 'recovery') actor.action = 'recover';
	if (action.phase === 'interrupted') actor.action = 'hit';
}

export function publishAuthoritativeEnemyState(actor, creature) {
	actor.bus.emit('enemy:authoritative-state', {
		action: creature.action,
		creatureId: creature.id,
		phase: creature.phase,
		role: creature.role,
		selected: Boolean(actor.selected)
	});
	if (actor.selected) actor.bus.emit('npc:target', actor.payload());
}

export function authoritativeEnemyStateSignature(actor) {
	const action = actor.authoritativeAction;
	return [
		actor.alive,
		actor.health,
		actor.looted,
		action?.actionInstanceId,
		action?.actionId || action?.id,
		action?.phase,
		progressSignature(action?.progress),
		action?.interruptResistance,
		action?.interruptResistanceRemaining,
		actor.authoritativePhase
	].join(':');
}

function progressSignature(value) {
	const number = Number(value);
	return Number.isFinite(number) ? number.toFixed(2) : '';
}
