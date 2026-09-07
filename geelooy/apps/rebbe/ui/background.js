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
 * Explicitly initializes the background once or resumes its existing session.
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

/** Pauses background animation only when a session was explicitly initialized. */
export function pauseBackground() {
	netzachBackgroundSession?.pause();
}

/**
 * Resumes only an existing background session; absence remains absence.
 * @returns {boolean} True when a session existed and was resumed.
 */
export function resumeBackground() {
	if (!netzachBackgroundSession) {
		return false;
	}
	netzachBackgroundSession.resume();
	return true;
}

/** Fully releases the background session for tests or explicit app teardown. */
export function destroyBackgroundEffect() {
	if (!netzachBackgroundSession) {
		return;
	}
	netzachBackgroundSession.destroy();
	netzachBackgroundSession = null;
}
