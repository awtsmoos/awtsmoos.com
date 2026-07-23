// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const policy = path.resolve(__dirname, "../../downloads/unix-version-policy.sh");
const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), "awts-version-policy-"));
const root = path.join(sandbox, "runtime");
const manifest = "B\"H\n1.0.380\nmain.js\n";
const manifestSha = crypto.createHash("sha256").update(manifest).digest("hex");
prepareRuntime();

/**
 * @file Proves an older publication cannot replace a newer verified runtime.
 * @description
 * The Awtsmoos preserves ascent: 1.0.380 may repair beneath a 1.0.376 publication,
 * while equal or newer publications continue through the ordinary transaction.
 */
try {
	const older = runPolicy("1.0.376", true);
	assert.equal(older.status, 0, older.stderr);
	assert.deepEqual(parse(older.stdout), {
		selected: "1.0.380",
		published: "1.0.376",
		preserve: "1",
		manifestSha
	});

	const equal = runPolicy("1.0.380", true);
	assert.equal(equal.status, 0, equal.stderr);
	assert.equal(parse(equal.stdout).preserve, "0");
	assert.equal(parse(equal.stdout).selected, "1.0.380");

	const newer = runPolicy("1.0.381", true);
	assert.equal(newer.status, 0, newer.stderr);
	assert.equal(parse(newer.stdout).preserve, "0");
	assert.equal(parse(newer.stdout).selected, "1.0.381");

	const unsealed = runPolicy("1.0.376", false);
	assert.equal(unsealed.status, 77);
	assert.match(unsealed.stdout, /downgrade was refused/i);

	console.log(JSON.stringify({
		ok: true,
		suite: "installer-downgrade-policy",
		newerLocalPreserved: true,
		unverifiedDowngradeRefused: true
	}, null, 2));
} finally {
	fs.rmSync(sandbox, { recursive: true, force: true });
}

function prepareRuntime() {
	fs.mkdirSync(root, { recursive: true });
	fs.writeFileSync(path.join(root, "main.js"), "// B\"H\n");
	fs.writeFileSync(path.join(root, "install-state.txt"), "1.0.380\n");
	fs.writeFileSync(path.join(root, "installed-manifest.txt"), manifest);
	fs.writeFileSync(path.join(root, "install-manifest.sha256"), `${manifestSha}\n`);
}

function runPolicy(published, sealed) {
	return spawnSync("bash", ["-c", shellScript()], {
		encoding: "utf8",
		env: {
			...process.env,
			ROOT: root,
			AWTS_TEST_MANIFEST_SHA: manifestSha,
			AWTS_TEST_PUBLISHED: published,
			AWTS_TEST_SEALED: sealed ? "1" : "0"
		}
	});
}

function shellScript() {
	return `set -euo pipefail
sha256_file() {
	printf '%s\\n' "$AWTS_TEST_MANIFEST_SHA"
}
installed_runtime_seal_valid() {
	[ "$AWTS_TEST_SEALED" = "1" ]
}
runtime_probe_compatible() {
	return 0
}
install_event() {
	:
}
install_fail() {
	printf '%s\\n' "$*"
	exit 77
}
source ${quote(policy)}
CANDIDATE_VERSION="$AWTS_TEST_PUBLISHED"
MANIFEST_SHA="$(printf 'f%.0s' {1..64})"
apply_installed_version_policy
printf 'selected=%s\\npublished=%s\\npreserve=%s\\nmanifestSha=%s\\n' \
	"$CANDIDATE_VERSION" "$PUBLISHED_VERSION" "$PRESERVE_NEWER_RELEASE" "$MANIFEST_SHA"`;
}

function parse(text) {
	return Object.fromEntries(text.trim().split("\n").map(line => line.split("=")));
}

function quote(value) {
	return `'${String(value).replace(/'/g, `'"'"'`)}'`;
}
