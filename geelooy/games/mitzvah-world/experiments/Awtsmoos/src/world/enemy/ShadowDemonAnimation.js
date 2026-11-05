// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ShadowDemonAnimation.js
 * @description Maps canonical hostile states onto audited local GLB animation intentions.
 * The Awtsmoos renews one intention through many finite poses; Awtsmoos.com lets
 * stillness, travel, warning, impact, recovery, and defeat wear honest garments.
 */

import { ENEMY_STATE } from './EnemyStates.js';

const ATTACK_STATES = new Set([
	ENEMY_STATE.ATTACK_ACTIVE,
	ENEMY_STATE.ATTACK_ANTICIPATION
]);

const TRAVEL_STATES = new Set([
	ENEMY_STATE.APPROACH,
	ENEMY_STATE.CHASE,
	ENEMY_STATE.CIRCLE,
	ENEMY_STATE.PATROL,
	ENEMY_STATE.RETREAT,
	ENEMY_STATE.RETURN_HOME,
	ENEMY_STATE.WANDER
]);

/** Resolves stable clip aliases from any compatible imported hostile model. */
export function shadowAnimationClipMap(names = []) {
	const idle = pick(names, /idle|stand/i, names[0] || '');
	const walk = pick(names, /walk|move|fly/i, idle);
	return {
		attack: pick(names, /attack|strike|bite/i, idle),
		death: pick(names, /death|defeat|die/i, idle),
		idle,
		walk
	};
}

/** Returns the clip intention for one canonical hostile state. */
export function shadowAnimationForState(state, clips) {
	if (state === ENEMY_STATE.DEFEATED || state === ENEMY_STATE.DESPAWN) return clips.death;
	if (ATTACK_STATES.has(state)) return clips.attack;
	if (TRAVEL_STATES.has(state)) return clips.walk;
	return clips.idle;
}

/** Advances an installed animation player without coupling policy to GLB clip names. */
export function updateShadowDemonAnimation(actor, deltaTime) {
	if (!actor.animationPlayer) return false;
	const desired = shadowAnimationForState(actor.state, actor.animationClips);
	if (desired && desired !== actor.animationState) {
		actor.animationPlayer.play(desired);
		actor.animationState = desired;
	}
	actor.animationPlayer.update(deltaTime);
	return true;
}

function pick(names, expression, fallback) {
	return names.find(name => expression.test(name)) || fallback;
}
