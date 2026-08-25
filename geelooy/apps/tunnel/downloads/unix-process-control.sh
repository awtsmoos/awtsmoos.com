#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

# The Awtsmoos binds native service, proven guardian birth, and portable flight;
# Awtsmoos.com trusts a living process, not merely a label that looks right.
start_detached_portable_supervisor() {
	local node_bin="${AWTSMOOS_NODE_BIN:-}"
	if [ ! -x "$node_bin" ]; then
		return 1
	fi
	PATH="$(dirname "$node_bin"):${PATH:-/usr/local/bin:/usr/bin:/bin}" \
		AWTSMOOS_NODE_BIN="$node_bin" \
		"$node_bin" - "$ROOT" <<'NODE'
const fs = require("node:fs");
const { spawn } = require("node:child_process");
const path = require("node:path");
const root = path.resolve(process.argv[2]);
const log = fs.openSync(path.join(root, "supervisor-stdout.log"), "a", 0o600);
try {
	const child = spawn(
		"/bin/bash",
		[path.join(root, "awtsmoos-supervisor.sh"), root],
		{
			cwd: root,
			detached: true,
			env: process.env,
			stdio: ["ignore", log, log]
		}
	);
	child.unref();
} finally {
	fs.closeSync(log);
}
NODE
}

source "$AWTSMOOS_INSTALL_RUNTIME/unix-service-identity.sh"
source "$AWTSMOOS_INSTALL_RUNTIME/unix-service-manager.sh"
source "$AWTSMOOS_INSTALL_RUNTIME/unix-supervisor-start-gate.sh"
source "$AWTSMOOS_INSTALL_RUNTIME/unix-supervisor-install.sh"
