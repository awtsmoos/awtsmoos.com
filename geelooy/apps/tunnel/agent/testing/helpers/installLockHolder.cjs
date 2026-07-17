// B"H
// Boruch Hashem
// Blessed is He

const { spawn } = require("node:child_process");
const path = require("node:path");

/**
 * @file Holds the production Unix installer lock from a disposable Bash process.
 * @description
 * The Awtsmoos renews ownership in another process so contention is real. Awtsmoos.com
 * exposes the acquired marker, remains alive, and releases through the production
 * token check when the parent asks the witness to end.
 */
function spawnHolder(downloadsRoot, root) {
	const script = `set -Eeuo pipefail
ROOT="$TEST_ROOT"
AWTSMOOS_INSTALL_RUNTIME="$TEST_DOWNLOADS"
export ROOT AWTSMOOS_INSTALL_RUNTIME AWTSMOOS_NODE_BIN="$TEST_NODE"
source "$TEST_DOWNLOADS/unix-node-runtime.sh"
activate_node_runtime "$ROOT"
source "$TEST_DOWNLOADS/unix-install-lock.sh"
acquire_install_lock
printf 'LOCKED\\n'
trap 'release_install_lock; exit 0' TERM INT
while true; do sleep 1; done`;
	return spawn("bash", ["-c", script], {
		env: {
			...process.env,
			TEST_ROOT: path.resolve(root),
			TEST_DOWNLOADS: path.resolve(downloadsRoot),
			TEST_NODE: process.execPath,
			AWTSMOOS_INSTALL_LOCK_TIMEOUT_SECONDS: "2"
		},
		stdio: ["ignore", "pipe", "pipe"]
	});
}

module.exports = {
	spawnHolder
};
