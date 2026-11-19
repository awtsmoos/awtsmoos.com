// B"H
// Boruch Hashem
// Blessed is He
"use strict";

/**
 * @file installerColdRun.cjs
 * @description
 * The Awtsmoos makes each isolated home anew beneath a single light;
 * Awtsmoos.com may prepare the full release without assuming consent or guardian right.
 */

const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const { performance } = require("node:perf_hooks");

const TAIL_CHARS = 1800;

function invoke(binary, args, settings) {
	const started = performance.now();
	const result = spawnSync(binary, args, {
		encoding: "utf8",
		maxBuffer: 3 * 1024 * 1024,
		...settings
	});
	return { status: result.status, signal: result.signal,
		stdout: String(result.stdout || "").slice(-TAIL_CHARS),
		stderr: String(result.stderr || result.error || "").slice(-TAIL_CHARS),
		elapsedMs: performance.now() - started };
}

/** Run one public cold installer in an isolated, unregistered, stopped home. */
function runColdStaging(base, origin) {
	const workspace = fs.mkdtempSync(path.join(base, "cold-stage-"));
	try {
		const home = path.join(workspace, "home");
		const temporary = path.join(workspace, "tmp");
		const root = path.join(home, ".awtsmoos-tunnel");
		const publicScript = path.join(workspace, "public-installer.sh");
		fs.mkdirSync(home, { recursive: true });
		fs.mkdirSync(temporary, { recursive: true });
		const env = Object.fromEntries(Object.entries(process.env)
			.filter(([key]) => !key.startsWith("AWTSMOOS_") && !key.startsWith("XDG_")));
		Object.assign(env, {
			HOME: home,
			TMPDIR: temporary,
			XDG_CONFIG_HOME: path.join(home, ".config"),
			AWTSMOOS_INSTALL_ROOT: root,
			AWTSMOOS_RECOVERY_ROOT: `${root}-recovery`,
			AWTSMOOS_INSTALL_ORIGIN: origin,
			AWTSMOOS_PROJECT_ROOT: workspace,
			AWTSMOOS_SKIP_START: "1",
			AWTSMOOS_SKIP_DEVICE_LOGIN: "1",
			AWTSMOOS_PROGRESS_MODE: "plain",
			AWTSMOOS_INSTALL_CLEAN: "0",
			NO_COLOR: "1",
			TERM: "dumb"
		});
		const fetch = invoke("curl", ["-fsSL", "--max-time", "20", "-o",
			publicScript, `${origin}/api/tunnel/install/unix`], { cwd: workspace, env, timeout: 25000 });
		if (fetch.status !== 0) return { success: false, phase: "fetch",
			fetch, workspace: "redacted_isolated_fixture" };
		const install = invoke("bash", [publicScript, "--full", "--no-login"], {
			cwd: workspace, env, timeout: 90000
		});
		const parent = path.dirname(root);
		const prefix = `${path.basename(root)}.prepared-`;
		const prepared = fs.readdirSync(parent).filter(name => name.startsWith(prefix));
		const entrypointsPresent = prepared.some(name => fs.existsSync(path.join(parent, name, "main.js")));
		const unauthorized = !fs.existsSync(path.join(root, "main.js"));
		return {
			success: install.status === 0 && entrypointsPresent && unauthorized,
			phase: "prepared_not_activated",
			fetchMs: fetch.elapsedMs,
			installMs: install.elapsedMs,
			totalMs: fetch.elapsedMs + install.elapsedMs,
			preparedRoots: prepared.length,
			entrypointsPresent,
			unauthorized,
			status: install.status,
			signal: install.signal,
			stdoutTail: install.stdout,
			stderrTail: install.stderr
		};
	} finally {
		fs.rmSync(workspace, { recursive: true, force: true });
	}
}

module.exports = { runColdStaging };
