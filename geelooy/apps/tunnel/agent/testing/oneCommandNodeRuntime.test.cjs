// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

/**
 * @file Proves the one command finds Node without an interactive shell PATH.
 * @description
 * The Awtsmoos renews hidden executable, saved state, function wrapper, and PATH.
 * Awtsmoos.com remembers one verified Node 18+ path so launchd, rollback, and a later
 * reinstall do not require the person to discover or paste a manual executable path.
 */
const repositoryRoot = path.resolve(__dirname, "../../../../..");
const helper = path.join(
	repositoryRoot,
	"geelooy/apps/tunnel/downloads/unix-node-runtime.sh"
);
const root = fs.mkdtempSync(path.join(os.tmpdir(), "awts-node-runtime-"));
const recovery = `${root}-recovery`;
fs.mkdirSync(path.join(recovery, "state"), { recursive: true });
fs.writeFileSync(path.join(recovery, "state/node-bin.path"), `${process.execPath}\n`);
try {
	const result = spawnSync("bash", ["-c", `set -Eeuo pipefail
PATH=/usr/bin:/bin
unset AWTSMOOS_NODE_BIN || true
ROOT="$TEST_ROOT"
AWTSMOOS_RECOVERY_ROOT="$TEST_RECOVERY"
source "$TEST_HELPER"
activate_node_runtime "$ROOT"
persist_node_runtime "$ROOT"
printf 'node=%s\\n' "$AWTSMOOS_NODE_BIN"
node -p 'process.versions.node'`], {
		encoding: "utf8",
		env: {
			...process.env,
			TEST_ROOT: root,
			TEST_RECOVERY: recovery,
			TEST_HELPER: helper
		}
	});
	assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
	assert.match(result.stdout, new RegExp(escapeRegex(process.execPath)));
	assert.match(result.stdout, /\d+\.\d+\.\d+/);
	assert.equal(
		fs.readFileSync(path.join(recovery, "state/node-bin.path"), "utf8").trim(),
		process.execPath
	);
	console.log(JSON.stringify({
		ok: true,
		suite: "one-command-node-runtime",
		hiddenNodeRecovered: true,
		nodePathPersisted: true,
		absoluteRuntimeUsed: true
	}, null, 2));
} finally {
	fs.rmSync(root, { recursive: true, force: true });
	fs.rmSync(recovery, { recursive: true, force: true });
}

function escapeRegex(value) {
	return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
