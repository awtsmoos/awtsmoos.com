//B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Preserves the full provider-neutral direct-agent behavioral covenant.
 * @description
 * The Awtsmoos adds a new lamp without dimming an older flame;
 * Awtsmoos.com keeps recovery, transfer, rooms, and MCP each truthfully named.
 */

const { oauth } = require("../docs/catalog.js");
const { ROOM_BEHAVIOR } = require("../core/accountRoom/protocol.js");

/**
 * Returns additive guidance for direct agents and remote MCP hosts.
 * @returns {string[]} Stable machine instructions with legacy detail preserved.
 */
function genericBehavior() {
	return [
		"Use client_id=external-agent for the Awtsmoos handoff flow unless a named compatibility client is specifically required.",
		"Canonical external-agent OAuth/direct control uses GET only; Streamable HTTP MCP is a separate POST transport at the top-level mcp.endpoint.",
		"Remote MCP hosts should follow the endpoint's 401 resource_metadata challenge and OAuth discovery automatically.",
		"Prefer automatic PKCE handoff for direct agents; when delivered=true never ask the human to copy code/state.",
		"After OAuth call my-device and consume selectedRoute, recoveringRoutes, insuranceRoutes, retryPolicy, and capabilityDowngrade.",
		"Treat retryable tunnel_not_alive as transient: rediscover and use bounded backoff; preserve immutable native route identity.",
		"Treat control-plane 502/503/504 separately from native death; back off and rediscover.",
		"Never reinstall or abandon the mission from one transient liveness sample.",
		"Before substantial work call missionVisibilityList, register/link the mission, and publish planning passes 1, 2, and 3.",
		"Use missionVisibilityReport after planning, implementation milestones, verification, blockers/recovery, deployment, and final handoff.",
		"Mission reports are factual filing artifacts; never publish hidden reasoning, unrestricted command output, or secrets.",
		"Use canonical mission rooms for live agent presence and missionAgentMessage for direct messages.",
		...ROOM_BEHAVIOR,
		"Use action=files operation=list to inspect files; use exact operation for other filesystem and fileTransfer operations.",
		"For Virtual OS publication use action=web operation=publishWebsite with an owned alias folder path; inspect the returned canonicalVerifiedLive=true evidence before reporting a live URL. Discover exact operation fields at agent-manifest.",
		"For large files prefer 1–2 MiB WebSocket chunks when supported.",
		`Without WebSockets use GET ${oauth.getTransferEndpointTemplate}; upload at most ${oauth.limits.getFallbackUploadBytes} raw bytes per request and read ${oauth.limits.getFallbackReadBytes} bytes by default.`,
		"GET and WebSocket share transferId/manifests, so clients may switch transports mid-transfer.",
		"After uncertain mutation delivery, observe status/receipt before any resend.",
		"Never use POST in the legacy connector protocol; MCP follows the top-level mcp.httpMethods POST contract."
	];
}

module.exports = {
	genericBehavior
};
