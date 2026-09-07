// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const { COMPONENTS, buildInstallerComponents } = require(
	"../../../../api/tunnel/install/tools/installerComponents.js"
);

/**
 * @file Proves bootstrap runner, component archive, and recovery helpers form one covenant.
 * @description
 * The Awtsmoos lets a tiny first scroll fetch one trusted runner, while Awtsmoos.com
 * proves every later installer and bounded-recovery vessel is checksum-bound in the archive.
 */
const repositoryRoot = path.resolve(__dirname, "../../../../..");
const downloadsRoot = path.join(repositoryRoot, "geelooy/apps/tunnel/downloads");
const destination = fs.mkdtempSync(path.join(os.tmpdir(), "awtsmoos-installer-components-"));
const recoveryHelpers = [
	"unix-recovery-lanes.sh",
	"unix-recovery-lane-launchd.sh",
	"unix-recovery-lane-portable.sh",
	"unix-recovery-lane-install-success.sh",
	"unix-recovery-lane-detach.cjs",
	"unix-recovery-lane-paths.cjs",
	"unix-recovery-lane-plist.cjs"
];

try {
	const first = buildInstallerComponents();
	const second = buildInstallerComponents();
	assert.equal(first, second, "unchanged bundle should use the process cache");
	assert.equal(first.files, COMPONENTS.length);
	assert.ok(first.files >= 69, `unexpected component closure: ${first.files}`);
	assert.equal(hash(first.buffer), first.sha256);
	assert.ok(first.bytes > 0);

	const archive = path.join(destination, "components.tar.gz");
	const extracted = path.join(destination, "extracted");
	fs.writeFileSync(archive, first.buffer);
	fs.mkdirSync(extracted);
	const result = spawnSync("tar", ["-xzf", archive, "-C", extracted], { encoding: "utf8" });
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
		"unix-supervisor-emergency.sh",
		"unix-supervisor-network-state.cjs",
		"unix-supervisor-orphan-executors.cjs",
		"unix-service-cli.sh",
		...recoveryHelpers
	]) assert.ok(COMPONENTS.includes(required), `missing required component: ${required}`);
	assert.equal(COMPONENTS.includes("unix-bootstrap-components-download.sh"), false);

	const bootstrap = read("unix.sh");
	const runner = read("unix-bootstrap-run.sh");
	const components = read("unix-bootstrap-components.sh");
	const download = read("unix-bootstrap-components-download.sh");
	assert.match(bootstrap, /unix-bootstrap-run\.sh/);
	assert.match(bootstrap, /exec \/bin\/bash "\$run_script"/);
	for (const required of [
		"unix-node-runtime.sh",
		"unix-bootstrap-components.sh",
		"unix-bootstrap-components-download.sh"
	]) assert.match(runner, new RegExp(`fetch_bootstrap_file ${required.replaceAll(".", "\\.")}`));
	assert.match(components, /source "\$runtime_root\/unix-bootstrap-components-download\.sh"/);
	for (const helper of recoveryHelpers) {
		assert.ok(components.includes(helper), `bootstrap component list omits ${helper}`);
	}
	assert.match(download, /installer-components\.tar\.gz/);
	assert.match(download, /Using cached verified installer components/);
	assert.match(download, /Using compatible component download fallback/);
	assert.match(download, /file_sha256/);
	console.log(JSON.stringify({
		ok: true,
		suite: "installer-component-bundle",
		files: first.files,
		bytes: first.bytes,
		sha256: first.sha256,
		recoveryHelpers: recoveryHelpers.length,
		twoStageBootstrapVerified: true
	}, null, 2));
} finally {
	fs.rmSync(destination, { recursive: true, force: true });
}

function read(name) {
	return fs.readFileSync(path.join(downloadsRoot, name), "utf8");
}

function hash(value) {
	return crypto.createHash("sha256").update(value).digest("hex");
}
