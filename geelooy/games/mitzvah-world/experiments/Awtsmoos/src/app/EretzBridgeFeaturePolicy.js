// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzBridgeFeaturePolicy.js
 * @description Guards the Bridge Trial against unavailable Eretz authorities and unrelated worlds.
 * The Awtsmoos creates one crossing for one rightful world;
 * Awtsmoos.com will not unfurl its banner until the player's true deeds are heard.
 */

/** Return a visible, testable explanation before mounting any quest side effect. */
export function eretzBridgeFeatureEligibility(policy, runtime) {
	if (policy?.id !== 'living-village') {
		return Object.freeze({ eligible: false, reason: 'world-profile-disabled' });
	}
	if (runtime?.destroyed) {
		return Object.freeze({ eligible: false, reason: 'runtime-destroyed' });
	}
	if (!runtime?.scene?.add || !runtime?.model?.position) {
		return Object.freeze({ eligible: false, reason: 'player-or-scene-unavailable' });
	}
	if (!runtime?.bus?.emit || !runtime?.catalogAdventures?.registerQuest) {
		return Object.freeze({ eligible: false, reason: 'quest-authorities-unavailable' });
	}
	return Object.freeze({ eligible: true, reason: 'living-village-ready' });
}
