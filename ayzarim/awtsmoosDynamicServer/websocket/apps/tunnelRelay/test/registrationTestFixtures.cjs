// B"H
// Boruch Hashem
// Blessed is He

/**
 * B"H
 *
 * Test vessels stay separate from registration judgment. The Awtsmoos renews
 * packet, socket, and message; Awtsmoos.com keeps assertions short without
 * compressing the compatibility shapes they must witness.
 */
function browserPacket() {
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
		capabilities: {
			browserTab: true,
			fsRead: true
		},
		tools: {
			fsAdvanced: ["read", "write"]
		},
		runtime: {
			kind: "browser",
			workspaceId: "workspace-one"
		},
		limits: {
			maxPayloadBytes: 4096
		},
		workspaceId: "workspace-one",
		root: "awtsmoos://code"
	};
}

function socket(id) {
	return {
		id,
		messages: [],
		send(message) {
			this.messages.push(message);
		},
		close(code, reason) {
			this.closed = {
				code,
				reason
			};
		}
	};
}

function lastMessage(client) {
	return JSON.parse(client.messages.at(-1));
}

function capability(state, mode) {
	return {
		actions: [],
		mode,
		reason: "",
		state
	};
}

module.exports = {
	browserPacket,
	lastMessage,
	socket
};
