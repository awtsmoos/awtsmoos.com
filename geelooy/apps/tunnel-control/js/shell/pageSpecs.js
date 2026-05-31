// B"H

/**
 * B"H
 * Chapter 339: The Side Rail Made Room For The Council.
 *
 * These page definitions move real controls into focused shell pages. The
 * AI-agent council now stands between raw actions and account status, a chamber
 * where keys, delegates, and messages become visible.
 */
export const PAGE_SPECS = [
  { key: "setup", icon: "🛠️", title: "Root and permissions", desc: "Choose the project root and control exactly what the agent can do.", ids: ["loadConfigBtn", "saveConfigBtn", "rootPath", "chooseRootBtn", "openRootBtn", "rootsBtn", "useRepoRootBtn", "applyRootToExplorerBtn", "quickRoots", "allowWrite", "allowSecrets", "enableLocalHttpProxy", "toolFsList", "toolFsTree", "toolFsRead", "toolFsWrite", "toolFsBulk", "allowCommands", "toolCommand", "toolChrome", "configOut"] },
  { key: "apiKeys", icon: "🔐", title: "API key vault", desc: "Create, paste, activate, copy, and inspect scoped tunnel keys.", ids: ["refreshKeysBtn", "keyName", "keyRate", "keyBytes", "createKeyBtn", "apiKeyInput", "saveApiKeyBtn", "clearApiKeyBtn", "activeKeySummary", "savedKeysList", "keysOut"], classes: ["scopeBox"] },
  { key: "explorer", icon: "📁", title: "Project explorer", desc: "List, tree, select, preview, read, and bulk-read files.", ids: ["explorerPath", "treeDepth", "treeLimit", "listBtn", "treeBtn", "readBtn", "mdBtn", "explorerList", "explorerPreview", "explorerOut"], selectors: ["[data-viewer]"] },
  { key: "terminal", icon: "⌁", title: "Command runner", desc: "Run controlled commands inside the selected root.", ids: ["commandShell", "commandCwd", "commandTimeout", "commandMaxChars", "commandText", "runCommandBtn", "testCommandBtn", "testPwdBtn", "clearTerminalBtn", "terminalResult", "nodeScriptText", "runNodeScriptBtn", "clearNodeScriptBtn", "nodeScriptResult", "terminalOut"] },
  { key: "chrome", icon: "🌐", title: "Browser control", desc: "Find Chrome, launch/connect, navigate, click, type, evaluate, and run scripts.", ids: ["chromePath", "chromePort", "chromeUrl", "chromeSelector", "chromeText", "chromeWaitTimeout", "chromeExpression", "chromeScript", "chromeOut"], buttonText: ["Find Chrome", "Launch / Connect", "Status", "Navigate", "Wait", "Click", "Type", "Evaluate JS", "Run script"] },
  { key: "docs", icon: "📜", title: "Agent docs", desc: "Copy instructions and open human, JSON, and OpenAPI documentation.", ids: ["projectPath", "promptMode", "copyPromptBtn", "promptBox"], links: ["/api/tunnel/control/docs", "/api/tunnel/control/docs.json", "/apps/tunnel-control/openapi.yaml"] },
  { key: "usage", icon: "📊", title: "Usage and raw actions", desc: "Inspect usage, rate limits, and advanced tunnel calls.", ids: ["loadUsageBtn", "usageBox", "actionName", "actionPath", "maxChars", "writeContent", "bulkPaths", "bulkWriteJson", "runActionBtn", "copyActionUrlBtn", "actionUrlOut", "actionOut"] },
  { key: "aiAgents", icon: "🧠", title: "AI agents", desc: "Define provider keys, list delegates, and message another AI through shared streaming logic.", ids: ["aiProviderId", "aiProviderKey", "saveAiProviderKeyBtn", "removeAiProviderKeyBtn", "loadAiAgentsBtn", "aiAgentId", "aiAgentModel", "aiAgentSystem", "aiAgentMessage", "sendAiAgentBtn", "aiAgentsOut"] },
  { key: "account", icon: "👤", title: "Account and connection", desc: "Check login, device status, tunnel state, and raw identity responses.", ids: ["identitySummary", "deviceSummary", "identityBox", "deviceBox", "miniStatus", "refreshBtn", "refreshDeviceBtn", "tunnelName"] },
  { key: "install", icon: "⚡", title: "Install or restart", desc: "Copy the one-command installer for Windows, CMD, Mac, and Linux.", commandPage: true },
  { key: "mesh", icon: "🕸️", title: "Runtime mesh", desc: "Inspect runtimes, mounts, graph topology, projections, and timeline events." }
];

export const PAGE_ORDER = PAGE_SPECS.map(page => page.key);
export const PAGE_META = Object.fromEntries(PAGE_SPECS.map(page => [page.key, page]));
