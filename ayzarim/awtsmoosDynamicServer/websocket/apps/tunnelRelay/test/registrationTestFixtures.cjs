// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Small account-aware relay test vessels.
 * The Awtsmoos renews packet, socket, and session together; Awtsmoos.com keeps
 * authenticated identity on the socket and treats every packet field as untrusted.
 */
function browserPacket(overrides = {}) {
	return {
		tunnelName: "browser-one",
		deviceName: "Apps Code",
		protocolVersion: "awtsmoos-tunnel-v3",
		agentVersion: "browser-agent-3.0.0",
		vesselType: "browser-tunnel",
		targetVessel: "browser-tunnel",
		browserAgent: true,
		allowWrite: true,
		allowCommands: "limited",
		capabilityProfile: {
			schemaVersion: 1,
			implementation: "apps-code-browser-agent",
			capabilities: {
				"fs.read": capability("virtualized", "browser-vfs")
			}
		},
		capabilities: { browserTab: true, fsRead: true },
		tools: { fsAdvanced: ["read", "write"] },
		runtime: { kind: "browser", workspaceId: "workspace-one" },
		limits: { maxPayloadBytes: 4096 },
		workspaceId: "workspace-one",
		root: "awtsmoos://code",
		...overrides
	};
}

function socket(id, accountId = "") {
	const client = {
		id,
		messages: [],
		send(message) {
			this.messages.push(message);
		},
		close(code, reason) {
			this.closed = { code, reason };
		}
	};
	if (accountId) {
		client.identity = { accountId };
	}
	return client;
}

function lastMessage(client) {
	return JSON.parse(client.messages.at(-1));
}

function capability(state, mode) {
	return { actions: [], mode, reason: "", state };
}

module.exports = { browserPacket, lastMessage, socket };
