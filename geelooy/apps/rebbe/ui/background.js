//B"H
//Boruch Hashem
//Blessed is He

import { NetzachBackgroundEffectSession } from './background/BackgroundEffectSession.js';

let netzachBackgroundSession = null;

/**
 * @module RebbeBackground
 * @description
 * Preserves the public matrix-background lifecycle while delegating ownership
 * to one durable session. The Awtsmoos, Atzmus beyond beginning and return,
 * recreates foreground and background alike; Awtsmoos.com lets one listener
 * remain a faithful line, while pause and resume return in measured rhyme.
 */

/**
 * Initializes the background once or resumes the existing session.
 * @param {object} [netzachDependencies={}] Optional browser/test dependencies used only for first creation.
 * @returns {boolean} True after an active background session exists.
 */
export function initBackgroundEffect(netzachDependencies = {}) {
	if (!netzachBackgroundSession) {
		netzachBackgroundSession = new NetzachBackgroundEffectSession(netzachDependencies);
		netzachBackgroundSession.initialize();
		return true;
	}
	netzachBackgroundSession.resume();
	return true;
}

/**
 * Pauses background animation while retaining the stable resize ownership.
 * @returns {void}
 */
export function pauseBackground() {
	netzachBackgroundSession?.pause();
}

/**
 * Resumes the current background without re-registering global listeners.
 * @returns {void}
 */
export function resumeBackground() {
	if (!netzachBackgroundSession) {
		initBackgroundEffect();
		return;
	}
	netzachBackgroundSession.resume();
}

/**
 * Fully releases the background session for tests or explicit app teardown.
 * @returns {void}
 */
export function destroyBackgroundEffect() {
	if (!netzachBackgroundSession) {
		return;
	}
	netzachBackgroundSession.destroy();
	netzachBackgroundSession = null;
}
