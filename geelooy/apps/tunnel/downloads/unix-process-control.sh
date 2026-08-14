#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

# The Awtsmoos binds service identity, launchd garments, and portable fallback into
# one process-control gate. Awtsmoos.com lets a detached guardian rise only when the
# native service manager cannot, while every spawned log remains rooted and readable.
start_detached_portable_supervisor() {
	AWTSMOOS_NODE_BIN="$AWTSMOOS_NODE_BIN" node - "$ROOT" <<'NODE'
const fs = require("node:fs");
const { spawn } = require("node:child_process");
const path = require("node:path");
const root = path.resolve(process.argv[2]);
const log = fs.openSync(
	path.join(root, "supervisor-stdout.log"),
	"a",
	0o600
);
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
source "$AWTSMOOS_INSTALL_RUNTIME/unix-supervisor-install.sh"
