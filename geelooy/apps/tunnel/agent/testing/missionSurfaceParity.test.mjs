//B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { surfaceIdentity, registrationFields } from "../../../code/js/tunnel/mission-surface-identity.js";
import { createMissionSurfaceClient as createCodeClient } from "../../../code/js/tunnel/mission-surface-client.js";
import { browserMissionSurface } from "../../js/missionSurfaceIdentity.js";
import { createMissionSurfaceClient as createBrowserClient } from "../../js/missionSurfaceClient.js";
import { browserTunnelRegistration } from "../../js/browserPageTunnelProtocol.js";

const require = createRequire(import.meta.url);
const RelayMission = require("../../../../../ayzarim/awtsmoosDynamicServer/websocket/apps/tunnelRelay/missionSurfaceDescriptor.js");

/**
 * @file Proves Code/browser/relay preserve one Mission identity and call native authority.
 * @description The Awtsmoos reveals one Mission through several surfaces; Awtsmoos.com proves
 * every browser incarnation routes heartbeat, Room, Work and context to the existing Tunnel API.
 */
async function main() {
	const href = "https://awtsmoos.com/apps/code?missionId=m1&roomId=r1&agentId=a1&generation=3&spawnGroupId=s1";
	const location = {
		href,
		origin: "https://awtsmoos.com",
		protocol: "https:",
		host: "awtsmoos.com",
		pathname: "/apps/code"
	};
	const codeIdentity = surfaceIdentity({ location, agentSessionId: "session-code" });
	const browserIdentity = browserMissionSurface({ location, agentSessionId: "session-browser" });
	assert.equal(codeIdentity.missionId, "m1");
	assert.equal(browserIdentity.roomId, "r1");
	assert.equal(registrationFields({ ...codeIdentity }).missionParticipant, true);
	const packet = browserTunnelRegistration("browser-test", {}, {
		location,
		agentSessionId: "session-browser"
	});
	assert.equal(packet.missionId, "m1");
	assert.equal(packet.runtime.missionSurface.logicalAgentId, "a1");
	const relay = RelayMission.missionSurfaceDescriptor(packet);
	assert.equal(relay.missionParticipant, true);
	assert.equal(relay.missionId, "m1");
	assert.equal(relay.surface, "browser-tunnel");
	const calls = [];
	const fakeFetch = async (url, options) => {
		calls.push({ url, body: JSON.parse(options.body) });
		return { ok: true, status: 200, json: async () => ({ ok: true }) };
	};
	const codeClient = createCodeClient({
		location,
		origin: location.origin,
		tunnelName: "native-1",
		agentSessionId: "session-code",
		fetch: fakeFetch
	});
	const browserClient = createBrowserClient({
		location,
		origin: location.origin,
		tunnelName: "native-1",
		agentSessionId: "session-browser",
		fetch: fakeFetch
	});
	await codeClient.heartbeat({ status: "active" });
	await browserClient.contextPack({ query: "current work" });
	assert.equal(calls.length, 2);
	assert.match(calls[0].url, /api\/tunnel\/control\/fs\/native-1$/);
	assert.equal(calls[0].body.action, "missionAgentHeartbeat");
	assert.equal(calls[0].body.missionId, "m1");
	assert.equal(calls[0].body.agentSessionId, "session-code");
	assert.equal(calls[1].body.action, "aiContextPack");
	assert.equal(calls[1].body.logicalAgentId, "a1");
	console.log(JSON.stringify({ ok: true, suite: "mission-surface-parity" }));
}

main().catch(error => {
	console.error(error?.stack || error);
	process.exitCode = 1;
});
