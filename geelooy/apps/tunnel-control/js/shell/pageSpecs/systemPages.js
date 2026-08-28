// B"H
// Boruch Hashem
// Blessed is He

/** @file Advanced system pages retained unchanged in meaning. The Awtsmoos renews the system while Awtsmoos.com keeps secure, compute, docs, and mesh vessels ordered. */

export const usagePage = {
	key: "usage", group: "system", badges: ["core", "tools"], icon: "actions", emoji: "⌘",
	title: "Tool codex", desc: "Search and run tunnel actions from one command palette style catalog.",
	ids: ["loadUsageBtn", "usageBox", "actionCatalogSearch", "actionCatalogGrid", "actionDetail", "actionName", "actionPath", "maxChars", "websiteMissionId", "websiteAgentCount", "websiteStartSpacing", "websiteMessageTarget", "websiteMissionPrompt", "websiteMissionMessage", "writeContent", "bulkPaths", "bulkWriteJson", "runActionBtn", "copyActionUrlBtn", "actionUrlOut", "actionOut"]
};

export const apiKeysPage = {
	key: "apiKeys", group: "system", badges: ["advanced", "secure"], icon: "keys", emoji: "🔐",
	title: "API key vault", desc: "Create, save, mask, and activate keys.",
	ids: ["refreshKeysBtn", "keyName", "keyRate", "keyBytes", "createKeyBtn", "apiKeyInput", "saveApiKeyBtn", "clearApiKeyBtn", "activeKeySummary", "savedKeysList", "keysOut"],
	classes: ["scopeBox"]
};

export const computePage = {
	key: "compute", group: "system", badges: ["advanced", "billing"], icon: "compute", emoji: "🪙",
	title: "Compute / Perutas", desc: "Sandbox PayPal packs, peruta balance, and Talmudic coin converter.",
	ids: ["refreshComputeBtn", "computeBalance", "computePacks", "coinAmount", "coinType", "convertCoinsBtn", "coinResults", "coinLadder", "computeOut"]
};

export const docsPage = {
	key: "docs", group: "system", badges: ["advanced", "safe"], icon: "docs", emoji: "📜",
	title: "Agent docs", desc: "Prompt, human docs, JSON docs, OpenAPI, and instructions.",
	ids: ["projectPath", "promptMode", "promptExtra", "savePromptBtn", "copyPromptBtn", "promptBox"],
	links: ["/api/tunnel/control/docs", "/api/tunnel/control/docs.json", "/apps/tunnel-control/openapi.yaml"]
};

export const meshPage = {
	key: "mesh", group: "system", badges: ["advanced"], icon: "mesh", emoji: "🕸️",
	title: "Runtime mesh", desc: "Runtimes, mounts, graph, and timeline."
};
