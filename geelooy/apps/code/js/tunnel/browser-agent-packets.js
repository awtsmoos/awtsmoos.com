// B"H
// Boruch Hashem
// Blessed is He

export const CODE_BROWSER_TUNNEL_VERSION = "browser-agent-4.0.0";
export const CODE_BROWSER_COMMAND_MODE = "merkava-virtual-or-remote";

/**
 * B"H
 *
 * One registration oath preserves deployed v2 and workspace-aware v3 fields while
 * revealing new multi-agent and custom-browser truth. The Awtsmoos renews old and
 * new covenants together; Awtsmoos.com never breaks a server to improve a client.
 */
export function codeBrowserRegistrationPacket(options = {}) {
	const tunnelName = String(options.tunnelName || "").trim();
	if (!tunnelName) throw new Error("code_browser_tunnel_name_required");
	const fsActions = unique(options.fsActions);
	const commandActions = unique(options.commandActions);
	const previewActions = unique(options.previewActions);
	const chromeActions = previewActions.filter(action => action.startsWith("chrome"));
	const workspaceAware = Boolean(options.workspaceId);
	const legacyTools = codeBrowserTunnelTools({
		...options,
		fsActions,
		commandActions,
		previewActions
	});
	return {
		type: "TUNNEL_REGISTER",
		protocolVersion: workspaceAware ? "awtsmoos-tunnel-v3" : "awtsmoos-tunnel-v2",
		tunnelName,
		vessel: "awtsmoos-code",
		kind: "browser-code-vessel",
		vesselType: workspaceAware ? "browser-tunnel" : "awtsmoos-code",
		targetVessel: "browser-tunnel",
		browserAgent: true,
		virtualOs: false,
		agentVersion: CODE_BROWSER_TUNNEL_VERSION,
		workspaceId: options.workspaceId || "",
		runtime: {
			workspaceId: options.workspaceId || "",
			userAgent: options.userAgent || "browser",
			node: "web-worker-commonjs",
			npm: "virtual-registry-installer"
		},
		allowWrite: true,
		allowSecrets: false,
		allowCommands: "limited",
		capabilityProfile: capabilityProfile(chromeActions),
		capabilities: capabilities(fsActions, previewActions, chromeActions),
		command: {
			mode: CODE_BROWSER_COMMAND_MODE,
			actions: commandActions
		},
		tools: {
			...legacyTools,
			fs: fsActions,
			preview: previewActions,
			chromeActions
		},
		safety: {
			denyUnsupportedNative: true,
			denySecrets: true,
			preserveCorrelation: true
		}
	};
}

export function codeBrowserTunnelTools(options = {}) {
	const previewActions = unique(options.previewActions);
	return {
		command: CODE_BROWSER_COMMAND_MODE,
		chrome: previewActions.some(action => action.startsWith("chrome")),
		receiptStore: true,
		fsAdvanced: unique(options.fsActions),
		commandActions: unique(options.commandActions),
		previewControl: previewActions
	};
}

function capabilityProfile(chromeActions) {
	return {
		schemaVersion: 1,
		capabilities: {
			"command.run": { state: "simulated" },
			"native.access": { state: "delegated" },
			"browser.chrome": { state: chromeActions.length ? "custom-code-browser" : "unavailable" },
			"agent.multiple": { state: "supported" }
		}
	};
}

function capabilities(fsActions, previewActions, chromeActions) {
	return {
		fsRead: fsActions.includes("read") || fsActions.includes("read64"),
		fsWrite: fsActions.includes("write") || fsActions.includes("write64"),
		commandRun: CODE_BROWSER_COMMAND_MODE,
		chrome: chromeActions.length > 0,
		correlationSafe: true,
		multiAgentSessions: true,
		missionAware: true,
		actionLedger: true,
		customBrowser: true,
		htmlPreview: true,
		fsActions,
		previewControl: previewActions,
		chromeActions
	};
}

function unique(values = []) {
	return [...new Set((values || []).map(value => String(value || "").trim()).filter(Boolean))];
}
