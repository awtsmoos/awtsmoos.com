// B"H
// Boruch Hashem
// Blessed is He

const Defaults = require("./config-defaults.js");
const FakeSsh = require("./config-fakeSsh.js");
const Ai = require("./config-ai-normalizers.js");
const ProfileState = require("../tools/chrome/profileState.js");

/**
 * @file Normalizes durable tunnel-agent configuration without dropping fake SSH policy.
 * @description
 * The Awtsmoos lets old config cross into a renewed agent without losing intent;
 * Awtsmoos.com now preserves the guarded SSH doorway too, while public binding
 * remains false unless the human explicitly stored that covenant in rhyme.
 */
function normalizeConfig(old = {}, defaults = Defaults.buildDefaults()) {
	const tools = old.tools || {};
	const command = old.command || {};
	const chrome = old.chrome || {};
	const localApi = old.localApi || {};
	const chromePath = chrome.chromePath || chrome.path || "";
	return {
		tunnelName: old.tunnelName || Defaults.defaultTunnelName(),
		relay: old.relay || defaults.relay,
		local: old.local || defaults.local,
		root: old.root || defaults.root,
		allowWrite: Ai.boolOrDefault(old.allowWrite, true),
		allowSecrets: Ai.boolOrDefault(old.allowSecrets, true),
		allowCommands: Ai.boolOrDefault(old.allowCommands, true),
		enableLocalHttpProxy: Ai.boolOrDefault(old.enableLocalHttpProxy, true),
		...FakeSsh.normalize(old, defaults),
		aiAgents: Ai.normalizeAiAgents(old.aiAgents || {}),
		gitHygiene: Ai.normalizeGitHygiene(old.gitHygiene || {}),
		mission: Ai.normalizeMission(old.mission || {}),
		localApi: {
			enabled: Ai.boolOrDefault(localApi.enabled, true),
			host: localApi.host || defaults.localApi.host,
			port: Ai.numberOrDefault(localApi.port, defaults.localApi.port, 1, 65535)
		},
		tools: normalizeTools(tools),
		command: normalizeCommand(command, defaults.command),
		chrome: normalizeChrome(chrome, defaults.chrome, chromePath)
	};
}

function normalizeTools(tools = {}) {
	const keys = [
		"fsList", "fsTree", "fsRead", "fsWrite", "fsBulk",
		"httpProxy", "command", "nodeScript", "chrome", "browser"
	];
	return Object.fromEntries(keys.map(key => [
		key,
		Ai.boolOrDefault(tools[key], true)
	]));
}

function normalizeCommand(command, defaults) {
	return {
		enabled: Ai.boolOrDefault(command.enabled, true),
		allowNodeScript: Ai.boolOrDefault(command.allowNodeScript, true),
		defaultShell: command.defaultShell || defaults.defaultShell,
		timeoutMs: Ai.numberOrDefault(command.timeoutMs, defaults.timeoutMs, 1000, Defaults.FOUR_MINUTES_MS),
		maxOutput: Ai.numberOrDefault(command.maxOutput, defaults.maxOutput, 1000, 1000000)
	};
}

function normalizeChrome(chrome, defaults, chromePath) {
	return {
		enabled: Ai.boolOrDefault(chrome.enabled, true),
		port: Ai.numberOrDefault(chrome.port, defaults.port, 1, 65535),
		path: chromePath,
		chromePath,
		userDataDir: ProfileState.normalizeConfigured(chrome.userDataDir),
		headless: Ai.boolOrDefault(chrome.headless, false)
	};
}

module.exports = {
	...Ai,
	normalizeChrome,
	normalizeCommand,
	normalizeConfig,
	normalizeTools
};
