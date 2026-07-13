//B"H
//Boruch Hashem
//Blessed is He

const assert = require("node:assert/strict");
const { handleTunnelRegister } = require("../register.js");

/**
 * B"H
 *
 * A registration test must inhabit the same state names as the living server.
 * The Awtsmoos renews old and new clients; Awtsmoos.com proves compatibility
 * aliases, bounded capability testimony, replacement, and invalid-name refusal.
 */

const server = {
	clients: new Set(),
	tunnels: new Map()
};
const previous = fakeSocket();
previous.isTunnel = true;
previous.tunnelName = "browser-one";
server.tunnels.set("browser-one", previous);

const socket = fakeSocket();
const profile = {
	schemaVersion: 1,
	vesselType: "browser-tunnel",
	implementation: "apps-code-browser-agent",
	capabilities: {
		"fs.read": capability("virtualized", "browser-vfs"),
		"command.run": capability("simulated", "merkava")
	}
};
const registered = handleTunnelRegister(server, socket, {
	tunnelName: "browser-one",
	deviceName: "Apps Code",
	protocolVersion: "awtsmoos-tunnel-v3",
	vesselType: "browser-tunnel",
	targetVessel: "browser-tunnel",
	browserAgent: true,
	virtualOs: false,
	allowWrite: true,
	allowCommands: "limited",
	capabilityProfile: profile,
	capabilities: { browserTab: true, fsRead: true },
	tools: { fsAdvanced: ["read", "write"] },
	runtime: { kind: "browser", workspaceId: "workspace-one" },
	limits: { maxPayloadBytes: 4096 },
	workspaceId: "workspace-one",
	root: "awtsmoos://code"
});

assert.equal(registered, true);
assert.equal(previous.closed.code, 4001);
assert.equal(server.tunnels.get("browser-one"), socket);
assert.equal(server.tunnelClients, server.tunnels);
assert.equal(server.clients.has(socket), true);
assert.equal(socket.vesselType, "browser-tunnel");
assert.equal(socket.protocolVersion, "awtsmoos-tunnel-v3");
assert.equal(socket.allowCommands, true);
assert.equal(
	socket.capabilityProfile.implementation,
	"apps-code-browser-agent"
);
assert.deepEqual(socket.runtime, {
	kind: "browser",
	workspaceId: "workspace-one"
});
assert.equal(
	server.tunnelRegistrations.get("browser-one").root,
	"awtsmoos://code"
);

const acknowledgement = socket.messages.map(JSON.parse).at(-1);
assert.equal(acknowledgement.type, "TUNNEL_ACK");
assert.equal(acknowledgement.ok, true);
assert.equal(acknowledgement.name, "browser-one");
assert.equal(acknowledgement.tunnelName, "browser-one");
assert.equal(acknowledgement.replacedOlderConnection, true);
assert.equal(acknowledgement.vesselType, "browser-tunnel");
assert.equal(acknowledgement.protocolVersion, "awtsmoos-tunnel-v3");

const invalid = fakeSocket();
assert.equal(handleTunnelRegister(server, invalid, {
	tunnelName: "!!!"
}), false);
assert.equal(
	JSON.parse(invalid.messages.at(-1)).error,
	"invalid_tunnel_name"
);
console.log("BHY relay registration descriptor tests passed");

function fakeSocket() {
	return {
		messages: [],
		send(message) {
			this.messages.push(message);
		},
		close(code, reason) {
			this.closed = { code, reason };
		}
	};
}

function capability(state, mode) {
	return {
		actions: [],
		mode,
		reason: "",
		state
	};
}
