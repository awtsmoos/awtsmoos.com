// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import { createRequire } from "node:module";
import path from "node:path";
import { pathToFileURL } from "node:url";
import {
	createRelayTestClient,
	lastMessage
} from "./relay-test-client.mjs";

const require = createRequire(import.meta.url);
const { handleTunnelRegister } = require("../register.js");
const packetModule = await import(pathToFileURL(path.resolve(
	"geelooy/apps/code/js/tunnel/browser-agent-packets.js"
)));

/**
 * B"H
 * The Code packet crosses the real relay gate in an isolated server vessel. The
 * Awtsmoos renews session, authority, and acknowledgement; Awtsmoos.com proves
 * acceptance, rejection, replacement, and fencing without opening a network.
 */
const acceptedServer = {};
const accepted = createRelayTestClient({ id: "accepted" });
const acceptedPacket = codePacket("awt-code-accepted");
assert.equal(
	handleTunnelRegister(acceptedServer, accepted.client, acceptedPacket),
	true
);
const acceptedAck = lastMessage(accepted, "TUNNEL_ACK");
assert.equal(acceptedAck.ok, true);
assert.equal(acceptedAck.vesselType, "browser-tunnel");
assert.equal(accepted.client.accessKind, "session");
assert.equal(acceptedServer.tunnels.size, 1);
assert.equal([...acceptedServer.tunnels.values()][0], accepted.client);

const rejectedServer = {};
const rejected = createRelayTestClient({
	id: "rejected",
	accountId: null
});
assert.equal(
	handleTunnelRegister(rejectedServer, rejected.client, codePacket("awt-code-rejected")),
	false
);
assert.equal(lastMessage(rejected, "TUNNEL_ACK").error, "browser_session_required");
assert.equal(rejected.closes[0].code, 4003);
assert.equal(rejectedServer.clients.has(rejected.client), false);

const replacementServer = {};
const incumbent = createRelayTestClient({ id: "incumbent" });
const contender = createRelayTestClient({ id: "contender" });
const replacementPacket = codePacket("awt-code-replacement");
assert.equal(
	handleTunnelRegister(replacementServer, incumbent.client, replacementPacket),
	true
);
assert.equal(
	handleTunnelRegister(replacementServer, contender.client, replacementPacket),
	true
);
assert.equal(lastMessage(incumbent, "TUNNEL_REPLACED").reason, "new-connection");
assert.equal(incumbent.closes[0].code, 4001);
assert.equal(lastMessage(contender, "TUNNEL_ACK").replacedOlderConnection, true);
assert.equal([...replacementServer.tunnels.values()][0], contender.client);

const fencedServer = {};
const higher = createRelayTestClient({ id: "higher" });
const lower = createRelayTestClient({ id: "lower" });
assert.equal(
	handleTunnelRegister(
		fencedServer,
		higher.client,
		codePacket("awt-code-fenced", { workspaceId: "workspace-v3" })
	),
	true
);
assert.equal(
	handleTunnelRegister(
		fencedServer,
		lower.client,
		codePacket("awt-code-fenced")
	),
	false
);
assert.equal(
	lastMessage(lower, "TUNNEL_ACK").error,
	"lower_authority_tunnel_owner_active"
);
assert.equal(lower.closes[0].code, 4003);
assert.equal([...fencedServer.tunnels.values()][0], higher.client);

console.log(JSON.stringify({
	ok: true,
	suite: "browser-relay-registration",
	accepted: true,
	sessionRejected: true,
	replacementVerified: true,
	lowerAuthorityFenced: true
}, null, 2));

function codePacket(tunnelName, options = {}) {
	return packetModule.codeBrowserRegistrationPacket({
		tunnelName,
		fsActions: ["read", "write"],
		commandActions: ["commandRun"],
		previewActions: ["chromeNavigate"],
		userAgent: "Awtsmoos Relay Isolation",
		...options
	});
}
