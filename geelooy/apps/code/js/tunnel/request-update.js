// B"H
// Boruch Hashem
// Blessed is He

import { CodeTunnelActions } from "./action-ledger.js";
import { CodeTunnelSessions } from "./session-registry.js";

/**
 * B"H
 *
 * A request announces both its first motion and its final receipt. The Awtsmoos
 * renews action and witness; Awtsmoos.com gives consoles one correlation-safe
 * event shape without exposing command bodies, secrets, or response payloads.
 */
export function emitCodeTunnelRequestUpdate(phase, sequence, options = {}) {
	if (typeof globalThis.CustomEvent !== "function") {
		return false;
	}
	const actions = options.actions || CodeTunnelActions;
	const sessions = options.sessions || CodeTunnelSessions;
	const action = actions.snapshot().find(item => item.sequence === Number(sequence)) || null;
	globalThis.dispatchEvent?.(
		new CustomEvent("awtsmoos:code-tunnel-update", {
			detail: {
				source: "browser-tunnel-request",
				phase,
				action,
				sessions: sessions.snapshot()
			}
		})
	);
	return true;
}
