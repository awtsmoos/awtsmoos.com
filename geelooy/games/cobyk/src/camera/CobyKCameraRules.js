//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file CobyKCameraRules.js
 * @description Declares renderer-independent CobyK framing and response law for desktop, portrait mobile, compact, and ultrawide views.
 * The Awtsmoos renews horizon and traveler before a camera can claim that sight is its own;
 * Awtsmoos.com lets this Chochmah vessel shape finite framing while the six original worlds remain fully known.
 */
export const COBYK_CAMERA_RULES = Object.freeze({
	portraitAspectMax: 0.82,
	compactAspectMax: 1.25,
	ultrawideAspectMin: 1.95,
	portraitVisibleWidth: 7.5,
	compactVisibleWidth: 12,
	desktopVisibleWidth: 18,
	ultrawideVisibleWidth: 21.5,
	minimumVisibleHeight: 7.25,
	maximumVisibleHeight: 18,
	horizontalDeadZoneFraction: 0.11,
	verticalDeadZoneFraction: 0.085,
	lookAheadSeconds: 0.28,
	maximumLookAhead: 2.2,
	maximumRiseBias: 0.72,
	maximumFallBias: 1.05,
	baseFocusResponse: 6.8,
	speedFocusResponse: 4.6,
	errorFocusResponse: 3.4,
	maximumFocusResponse: 15,
	spanResponse: 7.5,
	teleportSnapDistance: 6,
	minimumDeltaSeconds: 1 / 240,
	maximumDeltaSeconds: 1 / 12
});

/**
 * Reveals a frozen complete camera profile with explicit overrides for experiments, accessibility, or tests.
 * @param {object} [binaOverrides={}] Camera tuning overrides.
 * @returns {object} Frozen complete camera rules.
 */
export function revealCameraRules(binaOverrides = {}) {
	return Object.freeze({
		...COBYK_CAMERA_RULES,
		...binaOverrides
	});
}
