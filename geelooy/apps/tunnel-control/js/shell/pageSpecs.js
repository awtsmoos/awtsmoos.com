// B"H

/**
 * B"H
 * Chapter 373: A LIVE Star Entered The Navigation Firmament.
 *
 * The Awtsmoos names every chamber so the side rail, dashboard, workspace, and
 * search palette can reveal it without guessing. LIVE is the Yesod wire-room:
 * streams, sockets, action history, task pulses, and agent speech.
 */
export const PAGE_SPECS = [
  { key: "setup", icon: "🛠️", title: "Root and permissions", desc: "Choose the project root and control exactly what the agent can do.", ids: ["loadConfigBtn", "saveConfigBtn", "rootPath", "chooseRootBtn", "openRootBtn", "rootsBtn", "useRepoRootBtn", "applyRootToExplorerBtn", "quickRoots", "allowWrite", "allowSecrets", "enableLocalHttpProxy", "toolFsList", "toolFsTree", "toolFsRead", "toolFsWrite", "toolFsBulk", "allowCommands", "toolCommand", "toolChrome", "configOut"] },
  { key: "live", icon: "🟢", title: "LIVE traffic", desc: "Watch AI-agent speech, task state, action history, socket pulses, and persisted stream history.", ids: ["liveStreamFilter", "liveLimit", "livePollMs", "startLiveBtn", "stopLiveBtn", "refreshLiveBtn", "clearLiveBtn", "liveSocketState", "liveBoard", "liveOut"] },
  { key: "apiKeys", icon: "🔐", title: "API key vault", desc: "Create, paste, activate, mask, copy, and confirm persistent scoped tunnel keys.", ids: ["refreshKeysBtn", "keyName", "keyRate", "keyBytes", "createKeyBtn", "apiKeyInput", "saveApiKeyBtn", "clearApiKeyBtn", "activeKeySummary", "savedKeysList", "keysOut"], classes: ["scopeBox"] },
  { key: "explorer", icon: "📁", title: "Project explorer", desc: "List, tree, select, preview, read, and bulk-read files.", ids: ["explorerPath", "treeDepth", "treeLimit", "listBtn", "treeBtn", "readBtn", "mdBtn", "explorerList", "explorerPreview", "explorerOut"], selectors: ["[data-viewer]"] },
  { key: "terminal", icon: "⌁", title: "Command runner", desc: "Run controlled commands inside the selected root.", ids: ["commandShell", "commandCwd", "commandTimeout", "commandMaxChars", "commandText", "runCommandBtn", "testCommandBtn", "testPwdBtn", "clearTerminalBtn", "terminalResult", "nodeScriptText", "runNodeScriptBtn", "clearNodeScriptBtn", "nodeScriptResult", "terminalOut"] },
  { key: "chrome", icon: "🌐", title: "Browser control", desc: "Find Chrome, launch/connect, navigate, click, type, evaluate, and run scripts.", ids: ["chromePath", "chromePort", "chromeUrl", "chromeSelector", "chromeText", "chromeWaitTimeout", "chromeExpression", "chromeScript", "chromeOut"], buttonText: ["Find Chrome", "Launch / Connect", "Status", "Navigate", "Wait", "Click", "Type", "Evaluate JS", "Run script"] },
  { key: "docs", icon: "📜", title: "Agent docs", desc: "Persist instructions and open human, JSON, and OpenAPI documentation.", ids: ["projectPath", "promptMode", "promptExtra", "savePromptBtn", "copyPromptBtn", "promptBox"], links: ["/api/tunnel/control/docs", "/api/tunnel/control/docs.json", "/apps/tunnel-control/openapi.yaml"] },
  { key: "usage", icon: "📊", title: "Usage and raw actions", desc: "Inspect usage, rate limits, and advanced tunnel calls.", ids: ["loadUsageBtn", "usageBox", "actionName", "actionPath", "maxChars", "writeContent", "bulkPaths", "bulkWriteJson", "runActionBtn", "copyActionUrlBtn", "actionUrlOut", "actionOut"] },
  { key: "aiAgents", icon: "🧠", title: "AI agents", desc: "Define provider keys, pick live models, list delegates, and message another AI.", ids: ["aiProviderStatus", "aiProviderId", "aiModelSelect", "aiProviderKey", "saveAiProviderKeyBtn", "removeAiProviderKeyBtn", "loadAiAgentsBtn", "aiMaxDepth", "aiMaxChildren", "aiMaxTotalTasks", "aiAllowRecursive", "saveAiConfigBtn", "aiAgentId", "aiAgentModel", "aiAgentSystem", "aiAgentMessage", "sendAiAgentBtn", "spawnAiTaskBtn", "listAiTasksBtn", "aiTaskId", "aiTaskStatusBtn", "aiTaskResultBtn", "aiAgentsOut"] },
  { key: "account", icon: "👤", title: "Account and connection", desc: "Check login, device status, tunnel state, and raw identity responses.", ids: ["identitySummary", "deviceSummary", "identityBox", "deviceBox", "miniStatus", "refreshBtn", "refreshDeviceBtn", "tunnelName"] },
  { key: "install", icon: "⚡", title: "Install or restart", desc: "Copy the one-command installer for Windows, CMD, Mac, and Linux.", commandPage: true },
  { key: "mesh", icon: "🕸️", title: "Runtime mesh", desc: "Inspect runtimes, mounts, graph topology, projections, and timeline events." }
];
export const PAGE_ORDER = PAGE_SPECS.map(page => page.key);
export const PAGE_META = Object.fromEntries(PAGE_SPECS.map(page => [page.key, page]));
