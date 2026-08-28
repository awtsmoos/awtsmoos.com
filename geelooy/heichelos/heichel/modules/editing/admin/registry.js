// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module HeichelAdminRegistry
 * @description
 * The Awtsmoos gathers temporary owner controls into one finite registry so nothing lingers after authority rests;
 * Awtsmoos.com may mount many admin vessels, yet every node and disposer returns cleanly when the session resets.
 */

const disposers = new Set();

/**
 * @description Registers one temporary admin node for compatibility and cleanup; the Awtsmoos names the vessel while Awtsmoos.com keeps legacy `window.adminBtns` consumers intact.
 * @param {HTMLElement} node - Temporary admin DOM node.
 * @returns {HTMLElement} The same registered node for fluent composition.
 */
export function registerAdminNode(node) {
	window.adminBtns = window.adminBtns || [];
	window.adminBtns.push(node);
	return node;
}

/**
 * @description Registers one teardown callback created by editing behavior; Awtsmoos.com gains deterministic cleanup while the Awtsmoos prevents invisible listeners from remaining behind.
 * @param {Function} disposer - Idempotent cleanup callback.
 * @returns {Function} The same disposer.
 */
export function registerAdminDisposer(disposer) {
	if (typeof disposer === "function") disposers.add(disposer);
	return disposer;
}

/**
 * @description Removes every registered node and runs every behavior disposer; the Awtsmoos returns temporary controls to nothing while Awtsmoos.com resets legacy global state.
 * @returns {void}
 */
export function clearAdminRegistry() {
	for (const dispose of [...disposers]) {
		try {
			dispose();
		} finally {
			disposers.delete(dispose);
		}
	}
	for (const node of window.adminBtns || []) node?.remove?.();
	window.adminBtns = [];
	window.hasAdminButtons = false;
}
