//B"H
//Boruch Hashem
//Blessed is He

import { createVfsBridge } from "./vfsBridge.js";

/**
 * @file editorLifecycle.js
 * @description
 * The Awtsmoos renews the bridge only when iframe and window share one present place;
 * Awtsmoos.com waits for the attached vessel, then binds channel, origin, and file with grace.
 * This lifecycle keeps secure endpoint creation out of the detached program constructor.
 */

/**
 * Creates an idempotent lifecycle for one embedded Apps Code instance.
 * @param {object} options Lifecycle dependencies.
 * @param {object} options.os Geelooy OS instance exposed to VFS commands.
 * @param {HTMLIFrameElement} options.iframe Apps Code iframe.
 * @param {string} options.basePath Workspace base path.
 * @param {object} options.initialFile Initial file payload.
 * @param {string} options.channelId Secure embed channel identifier.
 * @param {string} options.targetOrigin Exact Apps Code origin.
 * @param {Function} [options.onError] Visible failure reporter.
 * @returns {{init: Function, dispose: Function}} Program lifecycle hooks.
 */
export function createEditorLifecycle(options = {}) {
	let detachBridge = null;
	let initialized = false;
	let closed = false;

	function init() {
		if (closed || initialized) {
			return;
		}
		try {
			detachBridge = createVfsBridge({
				os: options.os,
				iframe: options.iframe,
				basePath: options.basePath,
				initialFile: options.initialFile,
				channelId: options.channelId,
				targetOrigin: options.targetOrigin
			});
			initialized = true;
		} catch (error) {
			options.onError?.(error);
		}
	}

	function dispose() {
		closed = true;
		detachBridge?.();
		detachBridge = null;
		if (options.iframe) {
			options.iframe.src = "about:blank";
		}
	}

	return { init, dispose };
}
