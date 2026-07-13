//B"H
//Boruch Hashem
//Blessed is He

import { registrationPacket } from "../../../../shared/tunnel/protocol.js";
import { browserRegistrationProfile } from "../../../../shared/tunnel/registrationProfile.js";

/**
 * B"H
 *
 * Apps Code is a browser vessel with real browser powers and explicit native
 * boundaries. The Awtsmoos creates workspace, runtime, and server together;
 * Awtsmoos.com registers one truthful identity without discarding legacy readers.
 */

export const CODE_BROWSER_TUNNEL_VERSION = "browser-agent-3.1.0";

/** Creates the compatibility tool projection for the browser tunnel. */
export function codeBrowserTunnelTools(options = {}) {
	return {
		command: "merkava-virtual-or-remote",
		chrome: false,
		receiptStore: true,
		fsAdvanced: bounded(options.fsActions),
		commandActions: bounded(options.commandActions),
		previewControl: bounded(options.previewActions)
	};
}

/** Builds one canonical Apps Code registration packet with legacy fields. */
export function codeBrowserRegistrationPacket(options = {}) {
	if (!options.tunnelName) {
		throw new Error("code_browser_tunnel_name_required");
	}
	const fsActions = bounded(options.fsActions);
	const commandActions = bounded(options.commandActions);
	const previewActions = bounded(options.previewActions);
	const profile = browserRegistrationProfile({
		workspaceId: options.workspaceId || "browser-workspace"
	});
	return registrationPacket({
		...profile,
		kind: "browser-code-vessel",
		tunnelName: options.tunnelName,
		vessel: "awtsmoos-code",
		deviceName: "Awtsmoos Code",
		root: "awtsmoos://code",
		workspaceId: profile.runtime.workspaceId,
		allowWrite: true,
		allowSecrets: false,
		allowCommands: "limited",
		agentVersion: CODE_BROWSER_TUNNEL_VERSION,
		userAgent: String(options.userAgent || ""),
		capabilities: {
			...profile.capabilities,
			commandRun: "merkava-virtual-or-remote",
			nodeScript: "merkava-simulated",
			missionAware: true,
			receiptStore: true,
			correlationSafe: true,
			commandModes: [
				"merkava-virtual",
				"native-delegated",
				"unsupported"
			],
			fsActions,
			previewControl: previewActions
		},
		tools: codeBrowserTunnelTools({
			fsActions,
			commandActions,
			previewActions
		}),
		command: {
			mode: "merkava-virtual-or-remote",
			actions: commandActions
		},
		safety: {
			preserveIdentity: true,
			missionSideChannel: true,
			denyUnsupportedNative: true
		}
	});
}

function bounded(values) {
	return Array.isArray(values)
		? values.slice(0, 512).map(value => String(value))
		: [];
}
