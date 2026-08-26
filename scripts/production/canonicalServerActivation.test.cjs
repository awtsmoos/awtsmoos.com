//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Canonical activation contract across source refusal, listener truth, and rollback.
 * @description
 * The Awtsmoos lets a production release approach only through witnessed source and
 * runtime garments. Awtsmoos.com proves both virtual-SSH environment and living socket,
 * then proves missing variables or doorway presence restore the former vessel in rhyme.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const {
	CanonicalActivationFixture,
	VIRTUAL_SSH_ENVIRONMENT
} = require("./test/canonicalActivationFixture.cjs");

const fixture = new CanonicalActivationFixture();

try {
	fixture.setup();
	const sha = fixture.git(fixture.repo, "rev-parse", "HEAD");
	proveDirtySourceRefusal(fixture, sha);
	proveCompleteEnvironmentActivation(fixture, sha);
	proveListenerAbsenceRollback(fixture, sha);
	proveEnvironmentDriftRollback(fixture, sha);
	console.log(JSON.stringify({
		ok: true,
		suite: "canonical-server-activation"
	}));
} finally {
	fixture.cleanup();
}

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

function proveCompleteEnvironmentActivation(current, sha) {
	const accepted = current.run(sha);
	assert.equal(accepted.status, 0, accepted.stderr);
	const installed = fs.readFileSync(current.override, "utf8");
	assert.match(installed, /VIRTUAL_SSH_HOST=0\.0\.0\.0/);
	assert.match(installed, /VIRTUAL_SSH_PORT=2223/);
	assert.match(accepted.stdout, /virtualSsh=verified/);
	assert.equal(fs.existsSync(current.artifact()), true);
	assert.equal(current.git(current.repo, "status", "--porcelain"), "");
}

function proveListenerAbsenceRollback(current, sha) {
	const sentinel = "LISTENER_ROLLBACK_SENTINEL\n";
	const previous = process.env.TEST_VIRTUAL_SSH_LISTENER_PRESENT;
	current.writeOverride(sentinel);
	process.env.TEST_VIRTUAL_SSH_LISTENER_PRESENT = "0";
	try {
		const refused = current.run(sha);
		assert.notEqual(refused.status, 0);
		assert.match(refused.stderr, /virtual_ssh_listener_missing/);
		assert.equal(fs.readFileSync(current.override, "utf8"), sentinel);
	} finally {
		restoreEnvironment("TEST_VIRTUAL_SSH_LISTENER_PRESENT", previous);
	}
}

function proveEnvironmentDriftRollback(current, sha) {
	const sentinel = "ROLLBACK_SENTINEL\n";
	current.writeOverride(sentinel);
	const incomplete = VIRTUAL_SSH_ENVIRONMENT.filter(value => {
		return !value.startsWith("VIRTUAL_SSH_PORT=");
	});
	const refused = current.run(sha, incomplete);
	assert.notEqual(refused.status, 0);
	assert.match(refused.stderr, /service_environment_missing_VIRTUAL_SSH_PORT/);
	assert.equal(fs.readFileSync(current.override, "utf8"), sentinel);
}

function restoreEnvironment(name, previous) {
	if (previous === undefined) {
		delete process.env[name];
		return;
	}
	process.env[name] = previous;
}
