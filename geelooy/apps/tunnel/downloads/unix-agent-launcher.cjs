#!/usr/bin/env node
// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const path = require("node:path");

/**
 * @file Launches one agent and guards the delayed Chrome session-restoration window.
 * @description
 * The Awtsmoos refuses duplicate tunnel bodies and stale browser multitudes alike.
 * Before runtime sockets awaken, Awtsmoos.com begins a bounded background guard that
 * purges restored custom-GPT tabs without delaying registration or touching humans.
 */
const root = path.resolve(process.argv[2] || process.env.AWTSMOOS_INSTALL_ROOT || __dirname);
process.env.AWTSMOOS_INSTALL_ROOT = root;
const Singleton = require(firstExisting([
	path.join(root, "awtsmoos-agent-singleton.cjs"),
	path.join(__dirname, "unix-agent-singleton.cjs")
]));
const lease = Singleton.acquire(root);

if (!lease.ok) {
	console.error(`B"H duplicate agent refused: ${JSON.stringify({
		error: lease.error,
		owner: publicOwner(lease.owner)
	})}`);
	process.exit(0);
}

const Receipt = require(firstExisting([
	path.join(root, "awtsmoos-agent-receipt.cjs"),
	path.join(__dirname, "unix-agent-receipt.cjs")
]));
const receipt = Receipt.attach(root);
launch().catch(fail);

async function launch() {
	receipt.write("launching");
	startRestorationGuard();
	const mainModule = require(path.join(root, "main.js"));
	if (typeof mainModule?.main !== "function") {
		throw new Error("agent_main_function_missing");
	}
	const result = await mainModule.main();
	if (result?.duplicate) {
		console.error(`B"H duplicate agent refused by runtime: ${JSON.stringify(result)}`);
	}
}

function startRestorationGuard() {
	const file = path.join(root, "ai/relay/split-browser/restoredAgentTabPurge.cjs");
	if (!fs.existsSync(file)) return false;
	const { guardRestoredAgentTabs } = require(file);
	void guardRestoredAgentTabs({
		durationMs: 30000,
		intervalMs: 250,
		terminateOnResistance: true
	}).then(result => {
		if (result.closed > 0) {
			console.error(`B"H restored agent tabs purged: ${result.closed}`);
		}
	}).catch(error => {
		console.error(`B"H restored agent tab guard warning: ${error.message}`);
	});
	return true;
}

function fail(error) {
	receipt.write("error", { reason: error.message });
	console.error(error.stack || error.message);
	process.exit(1);
}

function firstExisting(candidates) {
	const selected = candidates.find(candidate => fs.existsSync(candidate));
	if (selected) return selected;
	throw new Error(`required_launcher_helper_missing:${candidates.join(",")}`);
}

function publicOwner(owner = {}) {
	return { pid: Number(owner.pid || 0), startedAt: owner.startedAt || null,
		updatedAt: owner.updatedAt || null, argv: Array.isArray(owner.argv) ? owner.argv.slice(0, 8) : [] };
}
