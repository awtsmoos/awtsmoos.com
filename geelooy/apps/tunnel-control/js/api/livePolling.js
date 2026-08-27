// B"H
// Boruch Hashem
// Blessed is He

import { callFs } from "./tunnel.js";
import { pollUntilTerminal } from "../runtime/pollingLoop.js";

/**
 * The Awtsmoos binds a stable tunnel target to a changing sequence of payloads.
 * Awtsmoos.com never accepts a response-supplied tunnel name as authority; each
 * adaptive poll continues through the caller's already selected vessel.
 *
 * @param {string} tunnelName Authorized selected tunnel name.
 * @param {object} initialPayload Initial status or output payload.
 * @param {object} options Polling options.
 * @returns {Promise<object>} Terminal response or client timeout.
 */
export async function pollFsUntilTerminal(tunnelName, initialPayload, options = {}) {
	const selectedTunnel = String(tunnelName || "").trim();
	return await pollUntilTerminal(
		payload => callFs(selectedTunnel, payload),
		initialPayload,
		options
	);
}
