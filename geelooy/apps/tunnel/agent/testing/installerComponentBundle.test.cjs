// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const {
	COMPONENTS,
	buildInstallerComponents
} = require("../../../../api/tunnel/install/tools/installerComponents.js");

const repositoryRoot = path.resolve(__dirname, "../../../../..");
const downloadsRoot = path.join(repositoryRoot, "geelooy/apps/tunnel/downloads");
const destination = fs.mkdtempSync(path.join(os.tmpdir(), "awtsmoos-installer-components-"));

/**
 * @file Proves the one-request installer archive matches the shared bootstrap scroll.
 * @description
 * The Awtsmoos counts no obsolete fixed number. Every name declared by the fallback
 * manifest appears once in the deterministic archive with byte-identical contents,
 * including identity, candidate-proof, emergency, and supervisor repair helpers.
 */
try {
	const first = buildInstallerComponents();
	const second = buildInstallerComponents();
	assert.equal(first, second, "unchanged bundle should use the process cache");
	assert.equal(first.files, COMPONENTS.length);
	assert.ok(first.files >= 68, `unexpected component closure: ${first.files}`);
	assert.equal(hash(first.buffer), first.sha256);
	assert.ok(first.bytes > 0);

	const archive = path.join(destination, "components.tar.gz");
	fs.writeFileSync(archive, first.buffer);
	const extracted = path.join(destination, "extracted");
	fs.mkdirSync(extracted);
	const result = spawnSync("tar", ["-xzf", archive, "-C", extracted], {
		encoding: "utf8"
	});
	assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);

	for (const name of COMPONENTS) {
		const expected = fs.readFileSync(path.join(downloadsRoot, name));
		const actual = fs.readFileSync(path.join(extracted, name));
		assert.equal(hash(actual), hash(expected), `component bytes changed: ${name}`);
	}
	assert.deepEqual(fs.readdirSync(extracted).sort(), [...COMPONENTS].sort());

	for (const required of [
		"unix-install-sources.sh",
		"unix-candidate-probe.sh",
		"unix-activation-promotion.sh",
		"unix-emergency-capture.sh",
		"unix-supervisor-identity.sh",
		"unix-supervisor-emergency.sh"
	]) assert.ok(COMPONENTS.includes(required), `missing required component: ${required}`);

	const bootstrap = fs.readFileSync(path.join(downloadsRoot, "unix.sh"), "utf8");
	const componentBootstrap = fs.readFileSync(
		path.join(downloadsRoot, "unix-bootstrap-components.sh"),
		"utf8"
	);
	assert.match(bootstrap, /__AWTSMOOS_INSTALLER_COMPONENTS_SHA256__/);
	assert.match(bootstrap, /unix-bootstrap-components\.sh/);
	assert.match(componentBootstrap, /installer-components\.tar\.gz/);
	assert.match(componentBootstrap, /Using compatible component download fallback/);

	console.log(JSON.stringify({
		ok: true,
		suite: "installer-component-bundle",
		files: first.files,
		bytes: first.bytes,
		sha256: first.sha256,
		exactBytesVerified: true,
		sharedFallbackManifest: true
	}, null, 2));
} finally {
	fs.rmSync(destination, { recursive: true, force: true });
}

function hash(value) {
	return crypto.createHash("sha256").update(value).digest("hex");
}
