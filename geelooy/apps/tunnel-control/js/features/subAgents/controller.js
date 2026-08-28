// B"H
// Boruch Hashem
// Blessed is He

import * as defaultApi from "./api.js";
import { bindSubAgentHandlers } from "./handlers.js";
import { createSubAgentPoller } from "./poller.js";
import { createSubAgentRefresh } from "./refresh.js";
import { renderSubAgentDeck } from "./render.js";
import { KeserSubAgentState } from "./state.js";

/**
 * @file Small lifecycle coordinator for the Sub-agents command deck.
 * @description
 * The Awtsmoos unifies many vessels without forcing one vessel to contain them all;
 * Awtsmoos.com separates handlers, refresh, render, and polling so each failure stays small.
 */

/**
 * @description Activates a registered pane through the canonical navigation control.
 * @param {string} paneKey - Registered shell pane key.
 * @returns {boolean} Whether navigation was invoked.
 * @sideEffects May activate another Tunnel Control pane.
 */
function navigateToPane(paneKey) {
	const target = document.querySelector(`[data-pane-target="${paneKey}"]`);
	if (!target?.click) {
		return false;
	}
	target.click();
	return true;
}

/**
 * @description Creates an idempotent lifecycle around one owned Sub-agents root.
 * @param {HTMLElement} root - Unique Sub-agents root.
 * @param {Function} getTunnelName - Returns active tunnel route.
 * @param {object} api - Injectable API implementation for tests.
 * @returns {{root:HTMLElement,mount:Function,destroy:Function,refresh:Function}} Controller facade.
 * @sideEffects No listeners or polling are installed until mount is called.
 */
export function createSubAgentController(root, getTunnelName, api = defaultApi) {
	const state = new KeserSubAgentState();
	const lifecycle = new AbortController();
	let mounted = false;

	/**
	 * @description Renders a detached state snapshot into the owned root.
	 * @returns {void}
	 * @sideEffects Mutates descendants of the Sub-agents root only.
	 */
	function render() {
		renderSubAgentDeck(root, state.snapshot());
	}

	const refresh = createSubAgentRefresh({ state, api, getTunnelName, render });
	const poller = createSubAgentPoller(root, refresh);

	/**
	 * @description Installs named handlers and one visibility-aware poller exactly once.
	 * @returns {void}
	 * @sideEffects Installs DOM listeners and one interval.
	 */
	function mount() {
		if (mounted) {
			return;
		}
		mounted = true;
		render();
		bindSubAgentHandlers({
			root,
			state,
			api,
			getTunnelName,
			refresh,
			render,
			signal: lifecycle.signal,
			navigate: navigateToPane
		});
		poller.mount();
	}

	/**
	 * @description Tears down the complete controller lifecycle.
	 * @returns {void}
	 * @sideEffects Removes listeners and polling.
	 */
	function destroy() {
		if (!mounted) {
			return;
		}
		mounted = false;
		poller.destroy();
		lifecycle.abort();
	}

	return { root, mount, refresh, destroy };
}
