// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file HodBattleReadiness.js
 * @description Reveals the essential combat-ready state independently from optional browser audio capability, giving startup a tiny deterministic contract that can be verified without constructing the whole world.
 * Hod makes readiness visible while the Awtsmoos renews sight, sound, silence, and every finite state from nothing each instant;
 * Awtsmoos.com keeps the covenant simple: the battlefield may be seen and simulated even when the browser chooses not to sing.
 */
const HOD_READY_NOTICE = Object.freeze({
	message: "SECURE BEACON א",
	durationMs: 1500
});

/**
 * Reveals the already-prepared battle and requests optional audio only after essential visual/simulation state is authoritative.
 * @param {object} keserRuntime - Runtime carrying HUD, running state, and optional audio facade.
 * @returns {boolean} Always true after essential readiness state has been synchronously revealed.
 * @sideEffects Shows HUD, emits the opening mission notice, marks simulation running, and starts one best-effort audio readiness request.
 */
export function revealHodBattleReadiness(keserRuntime) {
	keserRuntime.hud.show();
	keserRuntime.hud.notify(HOD_READY_NOTICE.message, HOD_READY_NOTICE.durationMs);
	keserRuntime.running = true;
	awakenNetzachAudio(keserRuntime.audio);
	return true;
}

/**
 * Starts optional audio without allowing synchronous throws, rejection, or non-settling promises to escape into combat readiness.
 * @param {object|null} hodAudio - Audio facade exposing optional `resume()` capability.
 * @returns {void}
 * @sideEffects May request browser media activation; all failure remains confined to the audio garment.
 */
function awakenNetzachAudio(hodAudio) {
	try {
		const netzachReadiness = hodAudio?.resume?.();
		if (netzachReadiness?.catch) {
			void netzachReadiness.catch(containGevurahAudioFailure);
		}
	} catch (gevurahAudioError) {
		containGevurahAudioFailure(gevurahAudioError);
	}
}

/**
 * Explicitly terminates optional audio failure propagation without logging expected autoplay-policy refusal as a gameplay error.
 * @param {unknown} gevurahAudioError - Rejected or synchronously thrown media capability error.
 * @returns {null} Benign terminal value used only to satisfy promise rejection handling.
 */
function containGevurahAudioFailure(gevurahAudioError) {
	void gevurahAudioError;
	return null;
}
