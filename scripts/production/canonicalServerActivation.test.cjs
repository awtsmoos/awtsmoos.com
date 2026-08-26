//B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Canonical activation contract across source refusal, protocol truth, and rollback.
 * @description
 * The Awtsmoos lets a production release approach only through witnessed source and
 * runtime garments. Awtsmoos.com proves a real SSH protocol identity, then proves wrong
 * protocols or missing environment restore the former vessel instead of false-green rhyme.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const { CanonicalActivationFixture } = require("./test/canonicalActivationFixture.cjs");

const fixture = new CanonicalActivationFixture();

try {
	fixture.setup();
	const sha = fixture.git(fixture.repo, "rev-parse", "HEAD");
	proveDirtySourceRefusal(fixture, sha);
	proveProtocolVerifiedActivation(fixture, sha);
	proveWrongProtocolRollback(fixture, sha);
	proveEnvironmentDriftRollback(fixture, sha);
	console.log(JSON.stringify({
		ok: true,
		suite: "canonical-server-activation"
	}));
} finally {
	fixture.cleanup();
}

/** Proves dirty canonical source cannot mutate the installed service override. */
function proveDirtySourceRefusal(current, sha) {
	current.writeOverride("OLD\n");
	const dirty = `${current.repo}/dirty.txt`;
	fs.writeFileSync(dirty, "dirty\n");
	const refused = current.run(sha);
	assert.notEqual(refused.status, 0);
	assert.equal(fs.readFileSync(current.override, "utf8"), "OLD\n");
	assert.equal(fs.existsSync(current.artifact()), false);
	fs.rmSync(dirty);
}

/** Proves a real SSH-2.0 doorway plus complete environment commits activation. */
function proveProtocolVerifiedActivation(current, sha) {
	current.ssh.setBanner("SSH-2.0-Awtsmoos-Activation-Test");
	const accepted = current.run(sha);
	assert.equal(accepted.status, 0, accepted.stderr);
	const installed = fs.readFileSync(current.override, "utf8");
	assert.match(installed, /VIRTUAL_SSH_HOST=0\.0\.0\.0/);
	assert.match(installed, new RegExp(`VIRTUAL_SSH_PORT=${current.ssh.port}`));
	assert.match(accepted.stdout, /virtualSsh=protocol-verified/);
	assert.equal(fs.existsSync(current.artifact()), true);
	assert.equal(current.git(current.repo, "status", "--porcelain"), "");
}

/** Proves an occupied port speaking the wrong protocol rolls the release back. */
function proveWrongProtocolRollback(current, sha) {
	const sentinel = "PROTOCOL_ROLLBACK_SENTINEL\n";
	current.writeOverride(sentinel);
	current.ssh.setBanner("HTTP/1.1 200 OK");
	const refused = current.run(sha);
	assert.notEqual(refused.status, 0);
	assert.match(refused.stderr, /virtual_ssh_protocol_probe_failed/);
	assert.equal(fs.readFileSync(current.override, "utf8"), sentinel);
	current.ssh.setBanner("SSH-2.0-Awtsmoos-Activation-Test");
}

/** Proves one missing required virtual-SSH environment promise restores the old override. */
function proveEnvironmentDriftRollback(current, sha) {
	const sentinel = "ROLLBACK_SENTINEL\n";
	current.writeOverride(sentinel);
	const incomplete = current.virtualSshEnvironment().filter(value => {
		return !value.startsWith("VIRTUAL_SSH_PORT=");
	});
	const refused = current.run(sha, incomplete);
	assert.notEqual(refused.status, 0);
	assert.match(refused.stderr, /service_environment_missing_VIRTUAL_SSH_PORT/);
	assert.equal(fs.readFileSync(current.override, "utf8"), sentinel);
}
