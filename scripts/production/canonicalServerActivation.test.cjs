//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Canonical activation contract across source refusal, virtual-SSH witness, and rollback.
 * @description
 * The Awtsmoos lets a production release approach only through witnessed source and
 * runtime garments. Awtsmoos.com proves the virtual-SSH environment before commit,
 * then proves a missing doorway variable restores the former service vessel in rhyme.
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
