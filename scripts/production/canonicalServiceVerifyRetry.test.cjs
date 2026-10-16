//B"H
// Boruch Hashem
// Blessed is He

"use strict";

/** Verify bounded SSH readiness retries with isolated service and Git fixtures. */
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const VERIFY = path.join(__dirname, "canonical-service-verify.sh");
const SHA = "a".repeat(40);

function fixture(mode) {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), "awts-ssh-ready-"));
	const bin = path.join(root, "bin");
	fs.mkdirSync(bin);
	const probe = path.join(root, "probe.sh");
	const count = path.join(root, "counter");
	const systemctl = `#!/usr/bin/env bash
if [ "$1" = "is-active" ]; then exit 0; fi
case "$4" in
WorkingDirectory) printf '%s\\n' "$AWTS_TEST_REPO" ;;
ExecStart) printf 'node %s/index.js\\n' "$AWTS_TEST_REPO" ;;
Environment) printf 'VIRTUAL_SSH_HOST=0.0.0.0 VIRTUAL_SSH_PUBLIC_HOST=awtsmoos.com VIRTUAL_SSH_PORT=2223 VIRTUAL_SSH_MAX_CONNECTIONS=64 VIRTUAL_SSH_CONNECTIONS_PER_MINUTE=60 VIRTUAL_SSH_IDLE_MS=1800000 VIRTUAL_SSH_TOKEN_TTL_MS=900000 AWTSMOOS_RELEASE_SHA=%s\\n' "$AWTS_TEST_SHA" ;;
esac`;
	const git = `#!/usr/bin/env bash
case "$3" in
rev-parse) printf '%s\\n' "$AWTS_TEST_SHA" ;;
status) exit 0 ;;
esac`;
	const probeBody = `#!/usr/bin/env bash
counter="${count}"
current=$(cat "$counter" 2>/dev/null || printf 0)
current=$(( current + 1 ))
printf '%s\\n' "$current" > "$counter"
if [ "${mode}" = "wrong" ]; then echo 'virtual_ssh_probe_invalid_banner' >&2; exit 1; fi
if [ "${mode}" = "silent" ] || [ "$current" -lt 3 ]; then echo 'virtual_ssh_probe_timeout' >&2; exit 1; fi
printf 'SSH-2.0-Awtsmoos-Test\\n'`;
	for (const [file, text] of [[path.join(bin, "systemctl"), systemctl], [path.join(bin, "git"), git], [probe, probeBody]]) {
		fs.writeFileSync(file, text, { mode: 0o755 });
	}
	const result = spawnSync("bash", [VERIFY, "awtsmoos.service", root, SHA, "2223", probe], {
		encoding: "utf8", timeout: 12000,
		env: { ...process.env, PATH: `${bin}:${process.env.PATH}`, AWTS_TEST_REPO: root,
			AWTS_TEST_SHA: SHA, AWTSMOOS_VIRTUAL_SSH_READY_ATTEMPTS: "4",
			AWTSMOOS_VIRTUAL_SSH_READY_DELAY_SECONDS: "0" }
	});
	const attempts = fs.existsSync(count) ? Number(fs.readFileSync(count, "utf8")) : 0;
	fs.rmSync(root, { recursive: true, force: true });
	return { ...result, attempts };
}

test("transient startup succeeds after two SSH timeouts", () => {
	const result = fixture("delayed");
	assert.equal(result.status, 0, result.stderr);
	assert.equal(result.attempts, 3);
	assert.match(result.stderr, /VIRTUAL_SSH_READINESS_RETRY/);
});

test("wrong protocol still fails immediately", () => {
	const result = fixture("wrong");
	assert.notEqual(result.status, 0);
	assert.equal(result.attempts, 1, result.stderr);
	assert.match(result.stderr, /virtual_ssh_protocol_probe_failed/);
});

test("permanently silent protocol fails after bounded attempts", () => {
	const result = fixture("silent");
	assert.notEqual(result.status, 0);
	assert.equal(result.attempts, 4, result.stderr);
	assert.match(result.stderr, /virtual_ssh_protocol_probe_failed/);
});
