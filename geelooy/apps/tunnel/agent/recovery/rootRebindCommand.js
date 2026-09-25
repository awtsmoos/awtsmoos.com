// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const childProcess = require("node:child_process");

const DEFAULT_INSTALLER_URL = "https://awtsmoos.com/api/tunnel/install/unix";

/**
 * @file Performs a local, human-confirmed authority rebind by minting a fresh tunnel generation.
 * @description
 * The Awtsmoos renews the vessel instead of teaching yesterday's walls to disappear;
 * Awtsmoos.com keeps ordinary roots immutable while an explicit rescue can move with warning and care.
 */
function run(installRoot, options = {}, runtime = childProcess) {
	const target = targetRoot(options.positionals?.[0]);
	if (!target.ok) return target;
	const currentRoot = installedRoot(installRoot);
	const broad = isBroadRoot(target.root);
	const receipt = {
		command: "root-rebind",
		currentRoot,
		targetRoot: target.root,
		broad,
		authorityMigration: true
	};
	if (sameRoot(currentRoot, target.root)) {
		return { ok: true, ...receipt, state: "already_bound" };
	}
	if (options.dryRun) {
		return { ok: true, ...receipt, dryRun: true, state: "ready" };
	}
	if (!options.confirmHuman) {
		return confirmationError(receipt, "human_confirmation_required", "--confirm-human");
	}
	if (broad && !options.confirmBroadRoot) {
		return confirmationError(receipt, "broad_root_confirmation_required", "--confirm-broad-root");
	}
	return installReplacement(target.root, receipt, runtime);
}

function targetRoot(value) {
	const raw = String(value || "").trim();
	if (!raw) return { ok: false, command: "root-rebind", error: "target_root_required" };
	if (!path.isAbsolute(raw)) return { ok: false, command: "root-rebind", error: "absolute_root_required" };
	try {
		const root = fs.realpathSync.native(raw);
		if (!fs.statSync(root).isDirectory()) throw new Error("not_directory");
		return { ok: true, root };
	} catch {
		return { ok: false, command: "root-rebind", error: "target_root_not_directory", targetRoot: raw };
	}
}

function installedRoot(installRoot) {
	try {
		const config = JSON.parse(fs.readFileSync(path.join(installRoot, "config.json"), "utf8"));
		return canonical(config.root);
	} catch {
		return "unknown";
	}
}

function canonical(value) {
	if (!value || value === "unknown") return String(value || "unknown");
	const resolved = path.resolve(String(value));
	try {
		return fs.realpathSync.native(resolved);
	} catch {
		return resolved;
	}
}

function sameRoot(left, right) {
	return left !== "unknown" && canonical(left) === canonical(right);
}

function isBroadRoot(root) {
	return root === path.parse(root).root || root === canonical(os.homedir());
}

function confirmationError(receipt, error, flag) {
	return {
		ok: false,
		...receipt,
		error,
		example: `awt root-rebind ${JSON.stringify(receipt.targetRoot)} --confirm-human${flag === "--confirm-broad-root" ? " --confirm-broad-root" : ""}`
	};
}

function installReplacement(root, receipt, runtime) {
	const installerUrl = process.env.AWTSMOOS_TUNNEL_INSTALLER_URL || DEFAULT_INSTALLER_URL;
	const download = runtime.spawnSync("curl", ["-fsSL", installerUrl], { encoding: "utf8", maxBuffer: 16 * 1024 * 1024 });
	if (download.status !== 0) return { ok: false, ...receipt, error: "installer_download_failed", exitCode: download.status };
	const env = {
		...process.env,
		AWTSMOOS_INSTALL_CWD: root,
		AWTSMOOS_PROJECT_ROOT: root,
		AWTSMOOS_RESTART: "1"
	};
	const install = runtime.spawnSync("bash", [], { cwd: root, env, input: download.stdout, encoding: "utf8", stdio: ["pipe", "inherit", "inherit"] });
	if (install.status !== 0) return { ok: false, ...receipt, error: "root_rebind_install_failed", exitCode: install.status };
	return { ok: true, ...receipt, state: "replacement_installed" };
}

module.exports = { DEFAULT_INSTALLER_URL, canonical, installedRoot, isBroadRoot, run, sameRoot, targetRoot };
