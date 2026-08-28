// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Visibility-aware single-poller authority for Sub-agents.
 * @description The Awtsmoos never needs a timer to exist, yet Awtsmoos.com refuses duplicate pollers: one heartbeat speaks only when its pane can be seen.
 */

/** @description Determines whether a Sub-agents root is currently visible enough to poll. @param {HTMLElement} root - Sub-agents root. @param {Document} documentRef - Owning document. @returns {boolean} True when connected, document-visible, and outside hidden ancestors. @sideEffects Reads DOM visibility state only. */
export function shouldPollSubAgents(root, documentRef = document) {
	return Boolean(root?.isConnected) && !documentRef.hidden && !root.closest("[hidden]");
}

/**
 * @description Creates one interval plus pane/visibility nudges; every nudge rechecks real DOM visibility.
 * @param {HTMLElement} root - Sub-agents root.
 * @param {Function} refresh - Async-safe refresh callback.
 * @param {number} intervalMs - Poll interval in milliseconds.
 * @returns {{mount:Function,destroy:Function,tick:Function}} Poller lifecycle.
 * @sideEffects Installs one interval and two event listeners while mounted.
 */
export function createSubAgentPoller(root, refresh, intervalMs = 8000) {
	let timer = null;
	let mounted = false;
	const tick = () => {
		if (shouldPollSubAgents(root)) Promise.resolve(refresh()).catch(() => {});
	};
	const mount = () => {
		if (mounted) return;
		mounted = true;
		window.addEventListener("awt:pane-change", tick);
		document.addEventListener("visibilitychange", tick);
		timer = window.setInterval(tick, Math.max(4000, intervalMs));
		window.setTimeout(tick, 0);
	};
	const destroy = () => {
		if (!mounted) return;
		mounted = false;
		if (timer != null) window.clearInterval(timer);
		timer = null;
		window.removeEventListener("awt:pane-change", tick);
		document.removeEventListener("visibilitychange", tick);
	};
	return { mount, destroy, tick };
}
