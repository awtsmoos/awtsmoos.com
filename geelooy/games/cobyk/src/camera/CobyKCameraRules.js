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
	// B"H — Yaakov 2026-10-13: player clearly visible but not overwhelming.
	// Was 2.0 (player ~22% of screen height — too tight). Now 2.8 (~16% of screen height).
	portraitVisibleWidth: 2.8,
	compactVisibleWidth: 6,
	desktopVisibleWidth: 12,
	ultrawideVisibleWidth: 17,
	minimumVisibleHeight: 3.5,
	maximumVisibleHeight: 14,
	// B"H — Yaakov 2026-10-13: camera must track the player tightly.
	// Dead zones shrunk to near-zero so the camera never feels disconnected.
	// B"H — Yaakov 2026-10-13: player sits slightly below center (not dead-center),
	// so more of the world ahead stays visible above.
	focusUpwardOffset: 0.45,
	horizontalDeadZoneFraction: 0.02,
	verticalDeadZoneFraction: 0.02,
	lookAheadSeconds: 0.18,
	maximumLookAhead: 1.6,
	maximumRiseBias: 0.5,
	maximumFallBias: 0.8,
	baseFocusResponse: 14.0,
	speedFocusResponse: 7.0,
	errorFocusResponse: 5.0,
	maximumFocusResponse: 22,
	spanResponse: 10.0,
	teleportSnapDistance: 4,
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
