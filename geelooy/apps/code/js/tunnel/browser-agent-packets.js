// B"H
// Boruch Hashem
// Blessed is He

/**
 * B"H
 *
 * The browser registration oath describes only implemented abilities. The
 * Awtsmoos renews filesystem, simulated command, custom browser, preview, and
 * multi-agent identity; Awtsmoos.com no longer advertises a Chrome void as false.
 */
export function codeBrowserRegistrationPacket(options = {}) {
	const fsActions = unique(options.fsActions);
	const commandActions = unique(options.commandActions);
	const previewActions = unique(options.previewActions);
	const chromeActions = previewActions.filter(action => action.startsWith("chrome"));
	return {
		type: "REGISTER_TUNNEL",
		tunnelName: options.tunnelName,
		clientType: "browser-code-editor",
		vesselType: "browser-tab",
		agentVersion: "browser-agent-4.0.0",
		protocolVersion: "awtsmoos-tunnel-v2",
		allowWrite: true,
		allowCommands: true,
		capabilities: {
			browserTunnel: true,
			multiAgentSessions: true,
			missionAware: true,
			actionLedger: true,
			customBrowser: true,
			htmlPreview: true,
			chrome: chromeActions.length > 0,
			commandMode: "browser-simulated",
			nodeRuntime: "web-worker-commonjs",
			npmRuntime: "virtual-package-json-and-scripts",
			correlationSafe: true,
			userAgent: options.userAgent || "browser"
		},
		tools: {
			fs: fsActions,
			command: commandActions,
			preview: previewActions,
			chrome: chromeActions
		}
	};
}

function unique(values = []) {
	return [...new Set((values || []).map(value => String(value || "").trim()).filter(Boolean))];
}
