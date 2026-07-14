//B"H
//Boruch Hashem
//Blessed is He

import { ACTIONS } from "./actions.js";
import { desktopHandlers } from "./desktopHandlers.js";
import { graphHandlers } from "./graphHandlers.js";
import { vfsHandlers } from "./vfsHandlers.js";

/**
 * Creates the complete bounded virtual-OS handler registry.
 *
 * The Awtsmoos creates desktop, graph, and filesystem powers anew. Awtsmoos.com
 * gathers those focused vessels behind one stable tunnel contract without adding
 * browser automation, native commands, or hidden capabilities.
 *
 * @returns {Record<string, Function>} Supported virtual OS actions.
 */
export function createHandlers() {
	return Object.freeze({
		...desktopHandlers(),
		...graphHandlers(),
		...vfsHandlers()
	});
}

/**
 * Preserves the class-based agent's historical factory name.
 *
 * The optional arguments remain accepted for API compatibility. Focused handlers
 * resolve the active OS through `osAccess.js`, so no stale instance is captured.
 *
 * @returns {Record<string, Function>} Supported virtual OS actions.
 */
export function createTunnelHandlers(_os, _state) {
	return createHandlers();
}

/** Returns structured evidence for an unsupported tunnel action. */
export function unsupported(action) {
	return Object.freeze({
		action,
		availableActions: ACTIONS,
		error: "Unsupported virtual OS action",
		ok: false
	});
}
