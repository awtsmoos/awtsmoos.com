//B"H
//Boruch Hashem
//Blessed be He

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
	navigateInteractiveTarget
} from "./interactiveClient.js";
import { createInteractiveBrowserSurface } from "./interactiveSurface.js";
import { activateInteractiveController } from "./interactiveControllerActivation.js";
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

	async function navigate(url, behavior = {}) {
		const requestedMode = behavior.engineMode || options.engineMode?.() || "headless";
		if (state?.engineMode === requestedMode) {
			return navigateInteractiveTarget({ ...state, url });
		}
		if (state) {
			await detachCurrentTarget();
		}
		const created = await createInteractiveSession({
			aliasId: options.aliasId(),
			engineMode: requestedMode,
			jarId: options.jarId(),
			url
		});
		state = normalizedInteractiveState({
			aliasId: options.aliasId(),
			engineMode: created.engineMode || requestedMode,
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

	async function detachCurrentTarget() {
		viewSync.stop();
		inputDispose?.();
		inputDispose = null;
		await closeInteractiveTarget(state).catch(() => {});
		state = null;
		popupBridge = null;
	}

	function activate() {
		const activated = activateInteractiveController({
			inputDispose,
			options,
			state,
			surface,
			viewSync
		});
		inputDispose = activated.inputDispose;
		popupBridge = activated.popupBridge;
	}

	function destroy() {
		viewSync.stop();
		inputDispose?.();
		if (state) closeInteractiveTarget(state).catch(() => {});
		state = null;
		surface.destroy();
	}
}
