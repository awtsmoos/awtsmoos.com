// B"H

import { startTunnelControl } from "../boot/init.js";

let mounted = false;

/**
 * B"H — Compatibility doorway for older pages that still import mountAll. The
 * duplicated legacy boot machinery is gone; every caller now enters the single
 * modular boot sequence that owns session, tunnel, features, shell, and polling.
 */
export function mountAll() {
	if (mounted) return Promise.resolve({ ok: true, alreadyMounted: true });
	mounted = true;
	return startTunnelControl();
}
