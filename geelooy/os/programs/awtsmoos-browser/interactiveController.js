//B"H
//Boruch Hashem
//Blessed be He

/**
 * @module InteractiveBrowserController
 * @description
 * The Awtsmoos lets one Chromium target endure while its visible vessel may rest;
 * Awtsmoos.com pauses hidden tabs without killing their history, cookies, or identity.
 */

import { createInteractiveBrowserSurface } from "./interactiveSurface.js";
import { activateInteractiveController } from "./interactiveControllerActivation.js";
import {
	clearInteractiveStateCookies,
	closeInteractiveState,
	createInteractiveState,
	existingInteractiveState,
	historyInteractiveState,
	navigateInteractiveState
} from "./interactiveTargetLifecycle.js";
import { createInteractiveViewSync } from "./interactiveViewSync.js";

export function createInteractiveBrowserController(options) {
	const surface = createInteractiveBrowserSurface(options.browserSurface);
	let state = null;
	let inputDispose = null;
	let popupBridge = null;
	let running = false;
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
		isRunning: () => running,
		navigate,
		pause,
		resume
	};

	async function attachExisting(input) {
		state = existingInteractiveState(input);
		resume();
		await viewSync.pollTargets();
		return state;
	}

	async function navigate(url, behavior = {}) {
		const requestedMode = behavior.engineMode || options.engineMode?.() || "headless";
		if (state?.engineMode === requestedMode) {
			resume();
			return navigateInteractiveState(state, url);
		}
		if (state) await detachCurrentTarget();
		const created = await createInteractiveState(options, url, requestedMode);
		state = created.state;
		resume();
		return created.created;
	}

	async function history(direction) {
		if (!state) return null;
		resume();
		return historyInteractiveState(state, direction);
	}

	async function clearCookies() {
		if (!state) return { cleared: false };
		return clearInteractiveStateCookies(state);
	}

	function resume() {
		if (!state || running) return Boolean(state);
		const activated = activateInteractiveController({
			inputDispose,
			options,
			state,
			surface,
			viewSync
		});
		inputDispose = activated.inputDispose;
		popupBridge = activated.popupBridge;
		running = true;
		return true;
	}

	function pause() {
		viewSync.stop();
		inputDispose?.();
		inputDispose = null;
		popupBridge = null;
		surface.setVisible(false);
		running = false;
	}

	async function detachCurrentTarget() {
		const closingState = state;
		pause();
		state = null;
		await closeInteractiveState(closingState);
	}

	function destroy() {
		const closingState = state;
		pause();
		state = null;
		closeInteractiveState(closingState);
		surface.destroy();
	}
}
