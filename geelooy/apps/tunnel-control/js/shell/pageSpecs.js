// B"H

const groups = Object.freeze({
  core: "Core",
  files: "Files",
  automation: "Automation",
  ai: "AI",
  system: "System"
});

/**
 * B"H
 * Chapter 25: The emoji sparks bowed to named icon vessels.
 *
 * Each page still has a fallback emoji, but the main UI receives icon keys so
 * SVG can carry the picture's clean line style while old surfaces keep working.
 */
export const PAGE_GROUPS = groups;

export const PAGE_SPECS = [
  { key: "setup", group: "core", badges: ["safe"], icon: "setup", emoji: "🛠️", title: "Root and permissions", desc: "Choose root and permissions.", ids: ["loadConfigBtn", "saveConfigBtn", "rootPath", "chooseRootBtn", "openRootBtn", "rootsBtn", "useRepoRootBtn", "applyRootToExplorerBtn", "quickRoots", "allowWrite", "allowSecrets", "enableLocalHttpProxy", "toolFsList", "toolFsTree", "toolFsRead", "toolFsWrite", "toolFsBulk", "allowCommands", "toolCommand", "toolChrome", "configOut"] },
  { key: "live", group: "automation", badges: ["live"], icon: "live", emoji: "🟢", title: "LIVE traffic", desc: "Events, streams, sockets, and history.", ids: ["liveStreamFilter", "liveLimit", "livePollMs", "startLiveBtn", "stopLiveBtn", "refreshLiveBtn", "clearLiveBtn", "liveSocketState", "liveBoard", "liveOut"] },
  { key: "apiKeys", group: "system", badges: ["secure"], icon: "keys", emoji: "🔐", title: "API key vault", desc: "Create, save, mask, and activate keys.", ids: ["refreshKeysBtn", "keyName", "keyRate", "keyBytes", "createKeyBtn", "apiKeyInput", "saveApiKeyBtn", "clearApiKeyBtn", "activeKeySummary", "savedKeysList", "keysOut"], classes: ["scopeBox"] },
  { key: "explorer", group: "files", badges: ["safe"], icon: "explorer", emoji: "📁", title: "Project explorer", desc: "List, tree, read, and preview files.", ids: ["explorerPath", "treeDepth", "treeLimit", "listBtn", "treeBtn", "readBtn", "mdBtn", "explorerList", "explorerPreview", "explorerOut"], selectors: ["[data-viewer]"] },
  { key: "terminal", group: "automation", badges: ["advanced"], icon: "terminal", emoji: "⌁", title: "Command runner", desc: "Run controlled shell and node commands.", ids: ["commandShell", "commandCwd", "commandTimeout", "commandMaxChars", "commandText", "runCommandBtn", "testCommandBtn", "testPwdBtn", "clearTerminalBtn", "terminalResult", "nodeScriptText", "runNodeScriptBtn", "clearNodeScriptBtn", "nodeScriptResult", "terminalOut"] },
  { key: "chrome", group: "automation", badges: ["browser"], icon: "chrome", emoji: "🌐", title: "Browser control", desc: "Launch, navigate, inspect, and run scripts.", ids: ["chromePath", "chromePort", "chromeUrl", "chromeSelector", "chromeText", "chromeWaitTimeout", "chromeExpression", "chromeScript", "chromeOut"], buttonText: ["Find Chrome", "Launch / Connect", "Status", "Navigate", "Wait", "Click", "Type", "Evaluate JS", "Run script"] },
  { key: "docs", group: "core", badges: ["safe"], icon: "docs", emoji: "📜", title: "Agent docs", desc: "Prompt, docs, OpenAPI, and instructions.", ids: ["projectPath", "promptMode", "promptExtra", "savePromptBtn", "copyPromptBtn", "promptBox"], links: ["/api/tunnel/control/docs", "/api/tunnel/control/docs.json", "/apps/tunnel-control/openapi.yaml"] },
  { key: "usage", group: "system", badges: ["advanced"], icon: "actions", emoji: "📊", title: "Action catalog", desc: "Search and run tunnel actions on demand.", ids: ["loadUsageBtn", "usageBox", "actionCatalogSearch", "actionCatalogGrid", "actionDetail", "actionName", "actionPath", "maxChars", "writeContent", "bulkPaths", "bulkWriteJson", "runActionBtn", "copyActionUrlBtn", "actionUrlOut", "actionOut"] },
  { key: "aiAgents", group: "ai", badges: ["advanced"], icon: "agents", emoji: "🧠", title: "AI agents", desc: "Provider keys, delegates, tasks, and messages.", ids: ["aiProviderStatus", "aiProviderId", "aiModelSelect", "aiProviderKey", "saveAiProviderKeyBtn", "removeAiProviderKeyBtn", "loadAiAgentsBtn", "aiMaxDepth", "aiMaxChildren", "aiMaxTotalTasks", "aiAllowRecursive", "saveAiConfigBtn", "aiAgentId", "aiAgentModel", "aiAgentSystem", "aiAgentMessage", "sendAiAgentBtn", "spawnAiTaskBtn", "listAiTasksBtn", "aiTaskId", "aiTaskStatusBtn", "aiTaskResultBtn", "aiAgentsOut"] },
  { key: "account", group: "core", badges: ["status"], icon: "account", emoji: "👤", title: "Account and connection", desc: "Login, device, tunnel, and identity state.", ids: ["identitySummary", "deviceSummary", "identityBox", "deviceBox", "miniStatus", "refreshBtn", "refreshDeviceBtn", "tunnelName"] },
  { key: "install", group: "core", badges: ["safe"], icon: "install", emoji: "⚡", title: "Install or restart", desc: "Copy installer commands.", commandPage: true },
  { key: "mesh", group: "system", badges: ["advanced"], icon: "mesh", emoji: "🕸️", title: "Runtime mesh", desc: "Runtimes, mounts, graph, and timeline." }
];
export const PAGE_ORDER = PAGE_SPECS.map(page => page.key);
export const PAGE_META = Object.fromEntries(PAGE_SPECS.map(page => [page.key, page]));
