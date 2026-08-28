// B"H
// Boruch Hashem
// Blessed is He

/** @file Automation and runtime-control pages. The Awtsmoos renews motion without confusion; Awtsmoos.com keeps every browser, terminal, and preview vessel explicitly named. */

export const livePage = {
	key: "live", group: "automation", badges: ["core", "table"], icon: "live", emoji: "🟢",
	title: "Live commands", desc: "Grouped current-chat tool activity: agent, action, target, result, and time.",
	ids: ["liveGroupBy", "liveFilter", "liveLimit", "livePollMs", "startLiveBtn", "stopLiveBtn", "refreshLiveBtn", "clearLiveBtn", "liveSocketState", "liveGroups", "liveSummary", "liveViewport", "liveWindow", "liveOut"]
};

export const remoteDesktopPage = {
	key: "remoteDesktop", group: "automation", badges: ["core", "consent"], icon: "preview", emoji: "🖥️",
	title: "Remote desktop", desc: "Create consent-first watch/control sessions over the tunnel."
};

export const terminalPage = {
	key: "terminal", group: "automation", badges: ["advanced"], icon: "terminal", emoji: "⌁",
	title: "Command runner", desc: "Run controlled shell and node commands.",
	ids: ["commandShell", "commandCwd", "commandTimeout", "commandMaxChars", "commandText", "runCommandBtn", "testCommandBtn", "testPwdBtn", "clearTerminalBtn", "terminalResult", "nodeScriptText", "runNodeScriptBtn", "clearNodeScriptBtn", "nodeScriptResult", "terminalOut"]
};

export const chromePage = {
	key: "chrome", group: "automation", badges: ["advanced", "browser"], icon: "chrome", emoji: "🌐",
	title: "Browser control", desc: "Launch native Chrome or use the virtual Node DOM engine to navigate, inspect, click, type, evaluate, and script pages.",
	ids: ["chromePath", "chromeEngine", "chromePort", "chromeUrl", "chromeSelector", "chromeText", "chromeWaitTimeout", "chromeExpression", "chromeScript", "chromeOut"],
	buttonText: ["Find Chrome", "Launch / Connect", "Status", "Navigate", "Wait", "Click", "Type", "Evaluate JS", "Run script"]
};

export const previewGatewayPage = {
	key: "previewGateway", group: "automation", badges: ["advanced", "share"], icon: "preview", emoji: "🔭",
	title: "Preview gateway", desc: "Protected view links, dynamic pages, live streams, and local server previews.",
	ids: [
		"conversationName", "conversationId", "registerConversationBtn", "refreshConversationsBtn", "previewKind",
		"previewVisibility", "previewTitle", "previewPath", "previewTtl", "previewTunnelName", "previewTargetVessel",
		"previewHtml", "createPreviewBtn", "refreshPreviewsBtn", "previewFrame", "previewList", "conversationHistory",
		"previewOut", "loadPreviewSettingsBtn", "savePreviewSettingsBtn", "allowAiManagePreview", "allowAiCreatePrivate",
		"allowAiCreatePublic", "allowAiExtendTtl", "allowAiEnableDownload", "allowAiExposeFolders", "allowAiExposeLocalServers"
	]
};
