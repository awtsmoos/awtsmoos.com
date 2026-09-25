//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module HeichelBootLifecycle
 * @description
 * The Awtsmoos lets readiness be a settled vessel: once Torah is revealed,
 * Awtsmoos.com may add color and motion without reopening the gate of failure.
 * This module owns that boundary so the entrypoint remains small and truthful.
 */

import { markHeichelBootState } from './route-context.js?v=ikar-authority-005';
import { renderFatalState } from './fatal-state.js?v=heichel-mobile-010';
import {
	schedulePostReadyExperience
} from './post-ready-experience.js?v=heichel-mobile-010';

/**
 * Creates the mutable public boot witness consumed by diagnostics and tests.
 * @returns {{started: boolean, ready: boolean, error: unknown, promise: Promise<void>|null}}
 * The initial critical-boot state.
 */
export function createBootState() {
	return {
		started: true,
		ready: false,
		error: null,
		promise: null
	};
}

/**
 * Publishes the successful terminal state of the critical Heichel boot.
 * @param {object} state Shared boot witness attached to the active window.
 * @returns {void}
 */
export function publishReadyState(state) {
	state.ready = true;
	state.error = null;
	markHeichelBootState('ready');
}

/**
 * Publishes a truthful critical failure and renders the recovery surface.
 * @param {object} state Shared boot witness attached to the active window.
 * @param {unknown} error Failure raised while opening essential Torah content.
 * @returns {void}
 */
export function publishErrorState(state, error) {
	state.ready = false;
	state.error = error;
	markHeichelBootState('error');
	renderFatalState(error);
}

/**
 * Releases optional experience after readiness without reopening the fatal gate.
 * @param {Document} documentRef Active Heichel document.
 * @param {Window} windowRef Active browser window.
 * @returns {void}
 */
export function releasePostReadyExperience(documentRef, windowRef) {
	try {
		schedulePostReadyExperience(documentRef, windowRef);
	} catch (error) {
		console.warn('B"H - Post-ready Heichel experience stayed optional:', error);
	}
}
