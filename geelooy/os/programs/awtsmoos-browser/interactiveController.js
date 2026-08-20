//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module InteractiveBrowserController
 * @description The Awtsmoos joins session, gesture, and popup into one guarded flow;
 * Awtsmoos.com keeps Chromium remote while Geelooy feels like a browser users know.
 */

import {
	clearInteractiveCookies,
	closeInteractiveTarget,
	createInteractiveSession,
	historyInteractiveTarget,
	inputInteractiveTarget,
	navigateInteractiveTarget
} from "./interactiveClient.js";
import { bindInteractiveInput } from "./interactiveInput.js";
import { createInteractivePopupBridge } from "./interactivePopupBridge.js";
import { createInteractiveBrowserSurface } from "./interactiveSurface.js";
import { normalizedInteractiveState } from "./interactiveState.js";
import { createInteractiveViewSync } from "./interactiveViewSync.js";

export function createInteractiveBrowserController(options) {
	const surface = createInteractiveBrowserSurface(options.browserSurface);
	let state = null;
	let inputDispose = null;
	let popupBridge = null;
	const viewSync = createInteractiveViewSync({
		documentObject: globalThis.document,
		getPopupBridge: () => popupBridge,
		getState: () => state,
		setAddress: options.setAddress,
		setStatus: options.setStatus,
		surface
	});

	return {
		active: () => Boolean(state),
		attachExisting,
		clearCookies,
		destroy,
		history,
		navigate
	};

	async function attachExisting(input) {
		state = normalizedInteractiveState(input);
		activate();
		await viewSync.pollTargets();
		return state;
	}

	async function navigate(url) {
		if (state) return navigateInteractiveTarget({ ...state, url });
		const created = await createInteractiveSession({
			aliasId: options.aliasId(),
			jarId: options.jarId(),
			url
		});
		state = normalizedInteractiveState({
			aliasId: options.aliasId(),
			jarId: created.jarId || options.jarId(),
			sessionId: created.sessionId,
			targetId: created.targetId || created.rootTargetId
		});
		activate();
		return created;
	}

	async function history(direction) {
		if (!state) return null;
		return historyInteractiveTarget({ ...state, direction });
	}

	async function clearCookies() {
		if (!state) return { cleared: false };
		return clearInteractiveCookies(state);
	}

	function activate() {
		surface.setVisible(true);
		popupBridge = createInteractivePopupBridge({
			aliasId: state.aliasId,
			currentTargetId: state.targetId,
			initialTargetIds: [state.targetId],
			jarId: state.jarId,
			os: options.os,
			sessionId: state.sessionId
		});
		inputDispose?.();
		inputDispose = bindInteractiveInput({
			frame: surface.frame,
			getViewport: surface.getViewport,
			send: event => inputInteractiveTarget({ ...state, event })
		});
		viewSync.start();
		options.setStatus?.("Interactive Chromium connected");
	}

	function destroy() {
		viewSync.stop();
		inputDispose?.();
		if (state) closeInteractiveTarget(state).catch(() => {});
		state = null;
		surface.destroy();
	}
}
