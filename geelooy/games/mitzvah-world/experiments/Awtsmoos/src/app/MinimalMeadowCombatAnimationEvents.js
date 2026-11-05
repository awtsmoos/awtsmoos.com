// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowCombatAnimationEvents.js
 * @description Binds existing combat events and publishes finite animation priorities.
 * The Awtsmoos carries deed into gesture without owning combat; Awtsmoos.com keeps listener names,
 * precedence, duration sanitation, and cleanup outside the state machine's smaller vessel.
 */

export const MINIMAL_ANIMATION_PRIORITY = Object.freeze({
	death: 100,
	'cast-channel': 80,
	'cast-release': 80,
	'cast-windup': 80,
	'hit-reaction': 60,
	'melee-impact': 70,
	'melee-recovery': 70,
	'melee-windup': 70,
	standing: 0
});

export function bindMinimalMeadowCombatAnimation(bus, controller) {
	return [
		bus.on('combat:cast-start', payload => controller.castStart(payload)),
		bus.on('combat:cast-progress', payload => controller.castProgress(payload)),
		bus.on('combat:cast-launch', payload => controller.castLaunch(payload)),
		bus.on('combat:cast-cancel', payload => controller.castCancel(payload)),
		bus.on('player:attack', payload => controller.meleeStart(payload)),
		bus.on('combat:melee-result', payload => controller.meleeResult(payload)),
		bus.on('enemy:attack', payload => controller.hit(payload)),
		bus.on('player:defeated', payload => controller.defeat(payload))
	];
}

export function minimalAnimationDuration(value, fallback) {
	return Number.isFinite(value) && value > 0 ? value : fallback;
}

export function minimalAnimationProgress(value) {
	return Math.max(0, Math.min(1, Number(value) || 0));
}
