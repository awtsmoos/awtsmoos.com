// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";

/**
 * @file Proves repeat installer bootstrap reuses only a checksum-verified component tar.
 * @description
 * The Awtsmoos remembers verified bytes without trusting memory blindly. Awtsmoos.com
 * re-hashes the cache on every repair so speed never replaces publication integrity.
 */
const root = fs.mkdtempSync(path.join(os.tmpdir(), "awts-component-cache-"));
const runtime = path.join(root, "runtime");
const source = path.join(root, "source");
const recovery = path.join(root, "recovery");
const components = path.resolve("geelooy/apps/tunnel/downloads/unix-bootstrap-components.sh");
const downloader = path.resolve("geelooy/apps/tunnel/downloads/unix-bootstrap-components-download.sh");
fs.mkdirSync(runtime, { recursive: true });
fs.mkdirSync(source, { recursive: true });
fs.copyFileSync(downloader, path.join(runtime, "unix-bootstrap-components-download.sh"));
const helperNames = discoverHelpers();
for (const helper of helperNames) {
	fs.writeFileSync(path.join(source, helper), `#!/bin/bash\n# ${helper}\n`, { mode: 0o755 });
}
const archive = path.join(root, "components.tar.gz");
execFileSync("tar", ["-czf", archive, "-C", source, ...helperNames]);
const sha = crypto.createHash("sha256").update(fs.readFileSync(archive)).digest("hex");
const cache = path.join(recovery, "cache", `installer-components-${sha}.tar.gz`);
fs.mkdirSync(path.dirname(cache), { recursive: true });
fs.copyFileSync(archive, cache);
const harness = path.join(root, "harness.sh");
fs.writeFileSync(harness, `#!/bin/bash
set -Eeuo pipefail
runtime_root=${quote(runtime)}
install_root=${quote(path.join(root, "install"))}
AWTSMOOS_RECOVERY_ROOT=${quote(recovery)}
AWTSMOOS_NODE_BIN=${quote(process.execPath)}
AWTSMOOS_INSTALLER_COMPONENTS_SHA256=${quote(sha)}
origin=https://invalid.example
bootstrap_progress() { :; }
source ${quote(components)}
archive_components
[ -x "$runtime_root/unix-service-cli.sh" ]
printf 'cache-ok\\n'
`, { mode: 0o755 });
try {
	const output = execFileSync("/bin/bash", [harness], { encoding: "utf8" });
	assert.equal(output.trim(), "cache-ok");
	assert.equal(fs.existsSync(cache), true);
	console.log(JSON.stringify({ ok: true, suite: "unix-installer-component-cache", reused: true }));
} finally {
	fs.rmSync(root, { recursive: true, force: true });
}

function discoverHelpers() {
	const shell = `runtime_root=${quote(runtime)}; source ${quote(components)}; printf '%s\\n' "\${helpers[@]}"`;
	return execFileSync("/bin/bash", ["-c", shell], { encoding: "utf8" })
		.trim().split("\n").filter(Boolean);
}

function quote(value) {
	return `'${String(value).replaceAll("'", "'\\''")}'`;
}
