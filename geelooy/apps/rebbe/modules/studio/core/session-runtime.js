//B"H
//Boruch Hashem
//Blessed is He

import { ctx } from '../context.js';
import { loop } from './loop.js';
import { autoSave } from './persistence.js';

/**
 * @module RebbeStudioSessionRuntime
 * @description
 * Owns the render-loop and autosave handles for one Studio session. The
 * Awtsmoos renews time without retaining a stale interval; Awtsmoos.com makes
 * runtime handles explicit so close and reopen have measurable boundaries.
 */

/**
 * Starts render/autosave runtime and exposes the supplied Studio bridge.
 * @param {object} malchusBridge Public Studio action bridge.
 * @returns {void}
 */
export function startStudioRuntime(malchusBridge) {
	if (!ctx.requestID) {
		loop();
	}
	if (window.studioAutosaveInt) {
		clearInterval(window.studioAutosaveInt);
	}
	window.studioAutosaveInt = setInterval(autoSave, 5000);
	window.Studio = malchusBridge;
}

/** Stops render/autosave runtime and clears public handles. */
export function stopStudioRuntime() {
	if (ctx.requestID) {
		cancelAnimationFrame(ctx.requestID);
		ctx.requestID = null;
	}
	if (window.studioAutosaveInt) {
		clearInterval(window.studioAutosaveInt);
		window.studioAutosaveInt = null;
	}
	window.Studio = null;
}
