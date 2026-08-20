// B"H
// Boruch Hashem
// Blessed is He

const { loadConfig, saveConfigPatch, HOME } = require("../../../lib/config.js");
const { openSystemExplorer } = require("../../../lib/open.js");
const { nativeRegistrationPacket } = require("../../../lib/registration.js");
const { driveRoots, rootBrowse } = require("../rootBrowser.js");
const { safePath } = require("../pathGuard.js");
const { ensureGitignoreHygiene } = require("../gitIgnoreHygiene.js");
const { publicConfig, defaultContinuationPrompt } = require("./configPublic.js");
const { assertPersistentRootImmutable } = require("./configRootPolicy.js");

/**
 * @file Exposes mutable preferences without exposing mutable root authority.
 * @description
 * The Awtsmoos lets settings change while the chosen earth remains one. Awtsmoos.com
 * permits cwd and browse movement only beneath the launch root and never treats a
 * dashboard, child agent, or configuration request as authority to select another.
 */
function registerAgain(ws, config, version) {
	if (!ws || !ws.opened) return;
	ws.sendJson(nativeRegistrationPacket({ config, agentVersion: version }));
}

async function handleConfigSet(payload, ws, version) {
	const current = loadConfig();
	assertPersistentRootImmutable(payload, current.root);
	const next = saveConfigPatch(mutablePatch(payload));
	const gitignore = await ensureGitignoreHygiene(next, "config-set");
	registerAgain(ws, next, version);
	return { ok: true, action: "configSet", config: publicConfig(next, version), gitignore };
}

function mutablePatch(payload = {}) {
	const patch = {};
	for (const key of ["local", "relay", "tunnelName"]) {
		if (payload[key]) patch[key] = String(payload[key]);
	}
	for (const key of ["allowWrite", "allowSecrets", "allowCommands", "enableLocalHttpProxy"]) {
		if (typeof payload[key] === "boolean") patch[key] = payload[key];
	}
	for (const key of ["tools", "gitHygiene", "chrome", "aiAgents"]) {
		if (payload[key] && typeof payload[key] === "object") patch[key] = payload[key];
	}
	if (payload.commandConfig && typeof payload.commandConfig === "object") patch.command = payload.commandConfig;
	if (payload.continuationPrompt !== undefined) patch.continuationPrompt = String(payload.continuationPrompt || "");
	return patch;
}

function buildConfigActions(ctx) {
	const { config, payload, ws, version } = ctx;
	const action = payload.action || "list";
	return {
		async configGet() {
			return { ok: true, action, config: publicConfig(loadConfig(), version) };
		},
		async configSet() {
			return handleConfigSet(payload, ws, version);
		},
		async gitIgnoreHygiene() {
			const result = await ensureGitignoreHygiene(config, "manual-action");
			return { ok: true, action: "gitIgnoreHygiene", result };
		},
		async roots() {
			return { ok: true, action, roots: driveRoots(config), home: HOME, cwd: config.root };
		},
		async rootBrowse() {
			return rootBrowse(config, payload);
		},
		async openRoot() {
			const target = safePath(config, payload.root || ".");
			openSystemExplorer(target);
			return { ok: true, action, opened: target };
		},
		async finishAndContinue() {
			const current = loadConfig();
			const prompt = payload.continuationPrompt || current.continuationPrompt || defaultContinuationPrompt();
			return {
				ok: true,
				action: "finishAndContinue",
				finished: true,
				finalInstruction: { role: "user", content: String(prompt) }
			};
		}
	};
}

module.exports = { buildConfigActions, handleConfigSet, mutablePatch, publicConfig, registerAgain };
