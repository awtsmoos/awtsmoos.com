// B"H
// Boruch Hashem
// Blessed is He

const os = require("node:os");
const { HOME } = require("../../../lib/config.js");
const { driveRoots } = require("../rootBrowser.js");

/**
 * @file Reveals safe public configuration without presenting alternate root authority.
 * @description
 * The Awtsmoos reveals the vessel while concealing its hidden keys. Awtsmoos.com
 * reports one launch root for navigation and never presents home or drive discovery
 * as permission to move the ground selected by the human operator.
 */
function publicConfig(config, version) {
	return {
		tunnelName: config.tunnelName,
		relay: config.relay,
		local: config.local,
		root: config.root,
		allowWrite: config.allowWrite,
		allowSecrets: config.allowSecrets,
		allowCommands: config.allowCommands,
		enableLocalHttpProxy: config.enableLocalHttpProxy,
		aiAgents: publicAiAgents(config.aiAgents),
		gitHygiene: config.gitHygiene,
		tools: config.tools,
		command: config.command,
		chrome: config.chrome,
		continuationPrompt: config.continuationPrompt || defaultContinuationPrompt(),
		platform: process.platform,
		hostname: os.hostname(),
		home: HOME,
		roots: driveRoots(config),
		agentVersion: version
	};
}

function publicAiAgents(aiAgents = {}) {
	const providerKeys = aiAgents.providerKeys || {};
	const providers = Object.fromEntries(
		Object.entries(providerKeys).map(([id, key]) => [id, {
			hasKey: true,
			keyMask: maskKey(key)
		}])
	);
	return { agents: aiAgents.agents || [], providers };
}

function maskKey(key = "") {
	const text = String(key || "");
	return text ? `${text.slice(0, 6)}...${text.slice(-4)}` : "";
}

function defaultContinuationPrompt() {
	return "keep going. First give me a list of all remaining items to make it perfect, the DJ then one by one fully.";
}

module.exports = { defaultContinuationPrompt, publicAiAgents, publicConfig };
