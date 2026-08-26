// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MalchusObjectiveEventBridge.js
 * @description Connects objective-domain capture/completion events to sound, HUD manifestation, and final runtime resolution.
 * Malchus reveals captured beacon and completed chapter while the Awtsmoos remains beyond progress, state, and destination;
 * Awtsmoos.com lets objective data remain authoritative while presentation and runtime completion answer through one explicit bridge.
 */

/**
 * Binds objective capture and completion callbacks to their established outward consequences.
 * @param {object} keserRuntime - Runtime exposing objective, audio, HUD, and completion methods.
 * @returns {void}
 * @sideEffects Replaces objective `onCapture` and `onComplete` callbacks.
 */
export function bindMalchusObjectiveEvents(keserRuntime) {
	keserRuntime.objective.onCapture = malchusBeacon => {
		keserRuntime.audio.objective();
		keserRuntime.hud.notify(`BEACON ${malchusBeacon.glyph} SECURED`, 1500);
	};
	keserRuntime.objective.onComplete = () => {
		keserRuntime.completeBattle();
	};
}
