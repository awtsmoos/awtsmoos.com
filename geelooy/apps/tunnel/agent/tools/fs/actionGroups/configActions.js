// B"H
// Boruch Hashem
// Blessed is He

const { loadConfig, saveConfigPatch, HOME } = require("../../../lib/config.js");
const { openSystemExplorer } = require("../../../lib/open.js");
const { nativeRegistrationPacket } = require("../../../lib/registration.js");
const { driveRoots, rootBrowse } = require("../rootBrowser.js");
const { ensureGitignoreHygiene } = require("../gitIgnoreHygiene.js");
const { publicConfig, defaultContinuationPrompt } = require("./configPublic.js");
const { assertPersistentRootImmutable } = require("./configRootPolicy.js");

/**
 * @file Exposes mutable tunnel preferences while making the persisted project root immutable.
 * @description
 * The Awtsmoos lets settings change without pulling the earth from under the route;
 * Awtsmoos.com uses per-request root and cwd for travel, while persistent root mutation stays out.
 */
function registerAgain(ws, config, version) {
	if (!ws || !ws.opened) return;
	ws.sendJson(nativeRegistrationPacket({ config, agentVersion: version }));
}

async function handleConfigSet(payload, ws, version) {
	assertPersistentRootImmutable(payload);
	const patch = mutablePatch(payload);
	const next = saveConfigPatch(patch);
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
	if (payload.commandConfig && typeof payload.commandConfig === "object") {
		patch.command = payload.commandConfig;
	}
	if (payload.continuationPrompt !== undefined) {
		patch.continuationPrompt = String(payload.continuationPrompt || "");
	}
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
			return { ok: true, action, roots: driveRoots(), home: HOME, cwd: process.cwd() };
		},
		async rootBrowse() {
			return rootBrowse(payload);
		},
		async openRoot() {
			const target = payload.root || config.root;
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
