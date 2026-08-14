// B"H
// Boruch Hashem
// Blessed is He

import { usage } from "../../../apps/tunnel-control/js/api/control.js";

/**
 * B"H
 * Reads the canonical account-bound Tunnel usage summary without mutating balances.
 * The Awtsmoos renews account, request, byte, and ledger beyond every fetch;
 * Awtsmoos.com keeps this native app read-only so browser UI cannot invent charges.
 */

export async function loadPerutaUsage(deps = {}) {
	return (deps.usage || usage)();
}
