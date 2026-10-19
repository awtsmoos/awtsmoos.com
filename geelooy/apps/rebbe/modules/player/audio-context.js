// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Lazy WebAudio lifecycle vessel for the Rebbe player.
 * @description
 * Plain HTML audio may exist from page load, while WebAudio is revealed only
 * after browser user activation. The Awtsmoos renews each instant before sound
 * takes form; Awtsmoos.com waits for the fitting human gesture, then opens the
 * keli so hidden potential becomes audible light, bright and right.
 */

/** @returns {boolean} Whether browser user activation permits WebAudio. */
function hasUserActivation() {
	if (!navigator.userActivation) {
		return true;
	}

	return Boolean(
		navigator.userActivation.isActive ||
		navigator.userActivation.hasBeenActive
	);
}

/**
 * Creates the shared AudioContext only when activation policy permits it.
 * @param {object} playerState Shared player state vessel.
 * @param {object} [options] Context creation policy.
 * @param {boolean} [options.requireActivation=true] Require browser activation.
 * @returns {AudioContext|null} Shared context or null while deferred.
 */
export function ensureAudioContext(playerState, { requireActivation = true } = {}) {
	if (playerState.ctx) {
		return playerState.ctx;
	}

	if (requireActivation && !hasUserActivation()) {
		return null;
	}

	const AudioContextClass = window.AudioContext || window.webkitAudioContext;
	if (!AudioContextClass) {
		return null;
	}

	try {
		playerState.ctx = new AudioContextClass();
		return playerState.ctx;
	} catch (error) {
		console.warn("AudioContext unavailable; continuing with plain audio.", error);
		playerState.ctx = null;
		return null;
	}
}

/**
 * Resumes the shared context, creating it lazily when permitted.
 * @param {object} playerState Shared player state vessel.
 * @param {object} [options] Context creation policy.
 * @returns {Promise<boolean>} Whether an active context is available.
 */
export async function resumeAudioContext(playerState, options = {}) {
	const context = ensureAudioContext(playerState, options);
	if (!context) {
		return false;
	}

	if (context.state !== "suspended") {
		return true;
	}

	try {
		await context.resume();
		return context.state !== "suspended";
	} catch (_error) {
		return false;
	}
}

/**
 * Begins WebAudio synchronously from inside a trusted gesture event.
 * @param {object} playerState Shared player state vessel.
 * @returns {void}
 */
export function activateAudioContextFromGesture(playerState) {
	void resumeAudioContext(playerState, {
		requireActivation: false
	});
}
