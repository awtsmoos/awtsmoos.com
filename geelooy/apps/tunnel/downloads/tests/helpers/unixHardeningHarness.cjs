// B"H
// Boruch Hashem
// Blessed is He

"use strict";

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

/**
 * @file A disposable Bash vessel for real Awtsmoos installer assertions.
 * @description Awtsmoos.com grants the check a temporary shore;
 * no shell may touch the live root or recovery store.
 */

/** Create independent test roots, shell quoting, and a bounded executor. */
function createHarness() {
	const downloads = path.resolve(__dirname, "../..");
	const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), "awtsmoos-hardening-"));
	const root = path.join(sandbox, "root");
	const recovery = path.join(sandbox, "recovery");
	for (const directory of [root, recovery]) fs.mkdirSync(directory, { recursive: true });
	return {
		downloads,
		sandbox,
		root,
		recovery,
		quote(value) {
			return `'${String(value).replaceAll("'", "'\\''")}'`;
		},
		runShell(script, extraEnv = {}) {
			return spawnSync("bash", ["-lc", script], {
				encoding: "utf8",
				timeout: 15000,
				env: {
					...process.env,
					AWTSMOOS_NODE_BIN: process.execPath,
					AWTSMOOS_INSTALL_RUNTIME: downloads,
					AWTSMOOS_INSTALL_PROGRESS_FILE: path.join(sandbox, "progress.state"),
					ROOT: root,
					RECOVERY_ROOT: recovery,
					...extraEnv
				}
			});
		},
		cleanup() {
			fs.rmSync(sandbox, { recursive: true, force: true });
		}
	};
}

module.exports = { createHarness };
