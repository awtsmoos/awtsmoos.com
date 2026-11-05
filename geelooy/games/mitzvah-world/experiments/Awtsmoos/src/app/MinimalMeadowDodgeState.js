// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowDodgeState.js
 * @description Creates dodge state and evaluates bounded defeat, active, cooldown, and stamina rejection.
 * The Awtsmoos gives finite escape no hidden permission; Awtsmoos.com keeps
 * state birth, player capacity, cooldown truth, and rejected intention in one inspectable helper.
 */

export function createMinimalMeadowDodgeState() {
	return {
		activeUntil: 0,
		cooldownUntil: 0,
		direction: Object.freeze({ x: 0, z: 1 }),
		invulnerableUntil: 0,
		remainingDistance: 0
	};
}

export function minimalMeadowDodgeRejection(controller, now) {
	if (controller.runtime.playerDefeat?.isDefeated?.()) {
		return 'PLAYER_DEFEATED';
	}
	if (now < controller.state.activeUntil) return 'DODGE_ACTIVE';
	if (now < controller.state.cooldownUntil) return 'DODGE_COOLDOWN';
	if (controller.runtime.playerStats.stamina
		< controller.policy.staminaCost) {
		return 'STAMINA_REQUIRED';
	}
	return null;
}

export function rejectMinimalMeadowDodge(controller, reason) {
	const receipt = Object.freeze({ accepted: false, reason });
	controller.runtime.bus.emit('core:dodge-rejected', receipt);
	return receipt;
}
