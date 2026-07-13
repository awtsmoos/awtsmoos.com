// B"H
// Boruch Hashem
// Blessed is He

import { makeTunnelResponse } from "./response.js";

/**
 * The Awtsmoos keeps packet parsing, bounded action execution, and correlated
 * replies in one protocol vessel for the Geelooy OS bridge on Awtsmoos.com.
 */

/**
 * Parses and answers one virtual OS packet.
 *
 * @param {object} agent Virtual OS tunnel agent.
 * @param {MessageEvent} event Socket message event.
 * @returns {Promise<void>} Completion promise.
 */
export async function receiveVirtualOsPacket(agent, event) {
	let packet;
	try {
		packet = JSON.parse(event.data);
	} catch (_error) {
		return;
	}
	if (packet.type !== "FS_REQUEST" || !packet.id) {
		return;
	}
	const response = await executeVirtualOsRequest(
		agent,
		packet.request || {}
	);
	const reply = makeTunnelResponse(packet.id, response);
	agent.socket?.send(JSON.stringify(reply));
}

/**
 * Executes one bounded request through the agent handler registry.
 *
 * @param {object} agent Virtual OS tunnel agent.
 * @param {object} request Tunnel request.
 * @returns {Promise<object>} Structured action result.
 */
export async function executeVirtualOsRequest(agent, request) {
	const handler = agent.handlers[request.action];
	if (!handler) {
		return {
			ok: false,
			error: "unsupported_virtual_os_action",
			action: request.action || ""
		};
	}
	try {
		return await handler(request);
	} catch (error) {
		return {
			ok: false,
			error: error.message || "virtual_os_action_failed"
		};
	}
}
