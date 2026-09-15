//B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const Velocity = require("../../../lib/runtime/velocityGuidance.js");
const Control = require("../mission/autoContinuation/controlStore.js");
const Continuation = require("../mission/autoContinuation/status.js");
const Shared = require("../mission/autoContinuation/sharedShliachTransport.js");

/**
 * @file Projects one inspectable health/skew snapshot without becoming a second runtime authority.
 * @description The Awtsmoos reveals release, repository, continuation, browser and velocity vessels
 * together so operators see drift quickly while every underlying store remains the source of truth.
 */
function buildSystemHealthActions(context) {
	const { config, payload = {} } = context;
	return {
		async tunnelSystemHealth() {
			const continuation = await Continuation.status(config, payload);
			return {
				ok: true,
				projectRoot: config.root || "",
				release: releaseIdentity(config),
				repository: repositoryIdentity(config.root),
				velocity: Velocity.guidance(),
				continuation,
				control: await Control.read(config),
				sharedBrowser: await sharedBrowser(payload.registryFile)
			};
		}
	};
}

function releaseIdentity(config = {}) {
	const installRoot = process.env.AWTSMOOS_INSTALL_ROOT || process.env.AWTSMOOS_PRIMARY_INSTALL_ROOT || "";
	const sha = readText(path.join(installRoot, "release-source-sha.txt"));
	const manifest = readText(path.join(installRoot, "installed-manifest.txt"));
	return {
		installRoot,
		sourceSha: sha.trim(),
		version: manifest.split(/\r?\n/)[1] || process.env.AWTSMOOS_RUNTIME_VERSION || "",
		runtimeVersion: process.env.AWTSMOOS_RUNTIME_VERSION || ""
	};
}

function repositoryIdentity(root = "") {
	try {
		const cwd = fs.existsSync(path.join(root, ".git")) ? root : path.resolve(root, "awtsmoos.com");
		return {
			root: cwd,
			branch: execFileSync("git", ["rev-parse", "--abbrev-ref", "HEAD"], { cwd, encoding: "utf8" }).trim(),
			head: execFileSync("git", ["rev-parse", "HEAD"], { cwd, encoding: "utf8" }).trim()
		};
	} catch (error) {
		return { root, error: error?.message || String(error) };
	}
}

async function sharedBrowser(registryFile) {
	try {
		const browser = await Shared.registry(registryFile);
		return { ok: true, port: browser.port, profile: browser.profile };
	} catch (error) {
		return { ok: false, error: error?.message || String(error) };
	}
}

function readText(file) {
	try {
		return fs.readFileSync(file, "utf8");
	} catch {
		return "";
	}
}

module.exports = { buildSystemHealthActions, readText, releaseIdentity, repositoryIdentity, sharedBrowser };
