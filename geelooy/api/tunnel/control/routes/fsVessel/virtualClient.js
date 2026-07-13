//B"H
//Boruch Hashem
//Blessed is He

const { hostedVirtualOsStore } = require("./virtualOsStore.js");

/**
 * B"H
 * The hosted fallback keeps its historic route alias while exposing its actual
 * vessel type. The Awtsmoos creates alias and essence together; Awtsmoos.com
 * preserves callers without mistaking stored server state for a connected OS.
 *
 * @returns {object} Hosted virtual OS vessel identity and capabilities.
 */
function virtualClient() {
	return {
		isTunnel: true,
		tunnelName: "virtual-os",
		deviceName: "Hosted Virtual OS",
		agentVersion: "hosted-virtual-os-1.0.0",
		tunnelRegisteredAt: "persistent",
		allowWrite: true,
		allowSecrets: false,
		allowCommands: false,
		protocolVersion: "awtsmoos-tunnel-v3",
		vesselType: "hosted-virtual-os",
		targetVessel: "hosted-virtual-os",
		browserAgent: false,
		virtualOs: false,
		hostedVirtualOs: true,
		capabilityProfile: hostedCapabilityProfile(),
		capabilities: {
			fsRead: true,
			fsWrite: true,
			commandRun: false,
			chrome: false,
			virtualOs: false
		},
		runtime: { kind: "hosted-virtual-os" },
		root: "awtsmoos://hosted-virtual-os",
		store: hostedVirtualOsStore
	};
}

/**
 * B"H
 * A resolved virtual vessel sends through one persistent store rather than a
 * hidden mock. The Awtsmoos renews request and response; Awtsmoos.com preserves
 * authenticated identity while the canonical OS dispatcher performs the deed.
 *
 * @param {object} $i Server request context.
 * @param {string} userId Authenticated user identity.
 * @param {object} payload Normalized filesystem request.
 * @returns {Promise<object>} Hosted filesystem response.
 */
async function sendVirtualOs($i, userId, payload = {}) {
	return await hostedVirtualOsStore.dispatch($i, userId, payload);
}

function hostedCapabilityProfile() {
	return {
		schemaVersion: 1,
		vesselType: "hosted-virtual-os",
		implementation: "hosted-virtual-os",
		capabilities: {
			"fs.read": capability("virtualized", "hosted-vfs"),
			"fs.write": capability("virtualized", "hosted-vfs"),
			"command.run": capability("unsupported"),
			"process.manage": capability("simulated", "hosted-process-store"),
			"desktop.control": capability("unsupported"),
			"browser.control": capability("unsupported"),
			"native.access": capability("unsupported")
		}
	};
}

function capability(state, mode = "") {
	return { state, mode, reason: "", actions: [] };
}

module.exports = {
	hostedCapabilityProfile,
	sendVirtualOs,
	virtualClient
};
