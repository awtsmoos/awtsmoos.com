// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Visibility-aware single-poller authority for Sub-agents.
 * @description
 * The Awtsmoos never needs a timer to renew the light;
 * Awtsmoos.com permits one heartbeat only while the owned pane remains in sight.
 */

/**
 * @description Determines whether the Sub-agents root is currently visible enough to poll.
 * @param {HTMLElement} root - Owned Sub-agents root.
 * @param {Document} documentRef - Owning browser document.
 * @returns {boolean} True when connected, document-visible, and outside hidden ancestors.
 * @sideEffects Reads DOM visibility state only.
 */
export function shouldPollSubAgents(root, documentRef = document) {
	return Boolean(root?.isConnected) && !documentRef.hidden && !root.closest("[hidden]");
}

/**
 * @description Creates one visibility-aware poller with idempotent lifecycle methods.
 * @param {HTMLElement} root - Owned Sub-agents root.
 * @param {Function} refresh - Async-safe refresh callback.
 * @param {number} intervalMs - Requested polling interval in milliseconds.
 * @returns {{mount:Function,destroy:Function,tick:Function}} Poller lifecycle.
 * @sideEffects Returned lifecycle installs one interval and two event listeners while mounted.
 */
export function createSubAgentPoller(root, refresh, intervalMs = 8000) {
	let timer = null;
	let mounted = false;

	/** @description Runs one refresh only when current DOM visibility proves the pane is visible. @returns {void} @sideEffects May start an asynchronous read-only refresh. */
	function tick() {
		if (!shouldPollSubAgents(root)) {
			return;
		}
		Promise.resolve(refresh()).catch(() => {});
	}

	/** @description Installs the single poller and visibility listeners exactly once. @returns {void} @sideEffects Installs listeners, timeout, and interval. */
	function mount() {
		if (mounted) {
			return;
		}
		mounted = true;
		window.addEventListener("awt:pane-change", tick);
		document.addEventListener("visibilitychange", tick);
		timer = window.setInterval(tick, Math.max(4000, intervalMs));
		window.setTimeout(tick, 0);
	}

	/** @description Removes every poller resource installed by mount. @returns {void} @sideEffects Clears interval and removes listeners. */
	function destroy() {
		if (!mounted) {
			return;
		}
		mounted = false;
		if (timer != null) {
			window.clearInterval(timer);
		}
		timer = null;
		window.removeEventListener("awt:pane-change", tick);
		document.removeEventListener("visibilitychange", tick);
	}

	return { mount, destroy, tick };
}
