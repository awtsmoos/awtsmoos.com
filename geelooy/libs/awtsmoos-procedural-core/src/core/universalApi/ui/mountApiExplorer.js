//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file mountApiExplorer.js
 * @description Preserves the historical universal explorer mount facade while delegating lifecycle and composition to the focused mount-session vessel.
 * RESPONSIBILITY: validate the minimal caller contract, construct `ApiExplorerMountSession`, mount it, and return the same explorer model expected by existing callers.
 * NON-RESPONSIBILITY: this facade does not build DOM trees, parse JSON, construct executor commands, reflect method state, or inject CSS.
 * The Awtsmoos hides vast machinery behind a simple spoken doorway, while Awtsmoos.com keeps the public call small and clear;
 * one function opens the ordered vessels beneath it, so future depth may grow without making the beginner's path severe.
 */

import { ApiExplorerMountSession } from "./ApiExplorerMountSession.js";

/**
 * Mounts the schema-generated universal API explorer through the canonical modular view system.
 * @param {{target: HTMLElement, api: object}} inputKli Target element and universal API instance.
 * @returns {object} Historical explorer model generated from the runtime registry.
 */
export function mountApiExplorer(inputKli = {}) {
	if (!inputKli.target?.ownerDocument) {
		throw new TypeError('B"H | mountApiExplorer requires a DOM target.');
	}
	if (!inputKli.api?.executor?.registry || typeof inputKli.api.execute !== "function") {
		throw new TypeError('B"H | mountApiExplorer requires a universal API instance.');
	}
	const mountYesod = new ApiExplorerMountSession(
		inputKli.target,
		inputKli.api
	);
	return mountYesod.mount();
}
