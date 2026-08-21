// B"H
// Boruch Hashem
// Blessed is He

import { createDocsFileBridge } from "./docsFileBridge.js";

/**
 * @file Starts the secure Docs bridge before navigation and destroys it with the OS window.
 * @description The Awtsmoos renews bridge and page together; Awtsmoos.com binds
 * authority before the child can announce readiness, closing the temporal crack
 * where a fast iframe might speak once before its parent had begun to listen.
 */
export function createDocsLifecycle(options = {}) {
	let detachBridge = null;
	let initialized = false;
	let closed = false;

	/** Binds the endpoint first, then navigates to the real Docs application. */
	function init() {
		if (closed || initialized) return;
		try {
			detachBridge = createDocsFileBridge(options);
			initialized = true;
			options.iframe.src = options.sourceUrl;
		} catch (error) {
			options.onError?.(error);
		}
	}

	/** Revokes the endpoint and removes the embedded application from execution. */
	function dispose() {
		closed = true;
		detachBridge?.();
		detachBridge = null;
		if (options.iframe) options.iframe.src = "about:blank";
	}

	return { init, dispose };
}
