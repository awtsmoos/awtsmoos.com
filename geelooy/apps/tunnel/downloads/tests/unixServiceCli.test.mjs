// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";

/**
 * @file Proves the stable service helper discovers and controls a hashed launchd label.
 * @description
 * The Awtsmoos gives users one permanent command while launchd's internal label may
 * vary with the install root. Awtsmoos.com repairs service custody without identity IO.
 */
const root = fs.mkdtempSync(path.join(os.tmpdir(), "awts-service-cli-"));
const installRoot = path.join(root, "install");
const plist = path.join(root, "com.awtsmoos.tunnel.fixture.plist");
const state = path.join(root, "loaded.state");
const log = path.join(root, "launchctl.log");
const label = "com.awtsmoos.tunnel.abcdef123456";
fs.mkdirSync(installRoot, { recursive: true });
fs.writeFileSync(path.join(installRoot, "install-state.txt"), "9.9.9\n");
fs.writeFileSync(plist, "fixture\n");
const plutil = executable("plutil", `#!/bin/bash
key="$2"
[ "$key" = Label ] && printf '${label}\\n' || printf '${installRoot}\\n'
`);
const launchctl = executable("launchctl", `#!/bin/bash
printf '%s\\n' "$*" >> '${log}'
case "$1" in
	print) [ -f '${state}' ] ;;
	bootstrap) touch '${state}' ;;
	bootout) rm -f '${state}' ;;
	esac
`);
const script = path.resolve("geelooy/apps/tunnel/downloads/unix-service-cli.sh");
const environment = {
	...process.env,
	AWTSMOOS_INSTALL_ROOT: installRoot,
	AWTSMOOS_SERVICE_CLI_PLIST: plist,
	AWTSMOOS_LAUNCHCTL_BIN: launchctl,
	AWTSMOOS_PLUTIL_BIN: plutil
};
try {
	const status = run("status");
	assert.match(status, /service=unloaded/);
	assert.match(status, new RegExp(`label=${label}`));
	run("start");
	assert.equal(fs.existsSync(state), true);
	let calls = fs.readFileSync(log, "utf8");
	assert.match(calls, /bootstrap gui\//);
	assert.match(calls, new RegExp(`kickstart -k gui/\\d+/${label}`));
	run("restart");
	calls = fs.readFileSync(log, "utf8");
	assert.match(calls, new RegExp(`bootout gui/\\d+/${label}`));
	assert.equal(fs.existsSync(state), true);
	const source = fs.readFileSync(script, "utf8");
	assert.doesNotMatch(source, /deviceIdentity|\bforget\b|private-key|credential/);
	console.log(JSON.stringify({ ok: true, suite: "unix-service-cli", hashedLabel: true }));
} finally {
	fs.rmSync(root, { recursive: true, force: true });
}

function run(action) {
	return execFileSync("/bin/bash", [script, action], { env: environment, encoding: "utf8" });
}

function executable(name, content) {
	const file = path.join(root, name);
	fs.writeFileSync(file, content, { mode: 0o755 });
	return file;
}
