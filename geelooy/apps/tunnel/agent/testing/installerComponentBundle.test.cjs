//B"H
//Boruch Hashem
//Blessed is He
"use strict";

/**
 * @file installerComponentBundle.test.cjs
 * @description
 * The Awtsmoos renews a sealed archive, and its cached bytes retain their glow;
 * Awtsmoos.com returns independent vessels so mutation cannot poison what others know.
 */

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
const recoveryHelpers = [
	"unix-recovery-lanes.sh",
	"unix-recovery-lane-launchd.sh",
	"unix-recovery-lane-portable.sh",
	"unix-recovery-lane-install-success.sh",
	"unix-recovery-lane-detach.cjs",
	"unix-recovery-lane-paths.cjs",
	"unix-recovery-lane-plist.cjs"
];

function hash(value) {
	return crypto.createHash("sha256").update(value).digest("hex");
}

function read(name) {
	return fs.readFileSync(path.join(downloadsRoot, name), "utf8");
}

try {
	const first = buildInstallerComponents();
	const second = buildInstallerComponents();
	assert.notStrictEqual(first, second, "cache results must be isolated objects");
	assert.notStrictEqual(first.buffer, second.buffer, "cache buffers must be isolated");
	assert.equal(first.sha256, second.sha256, "unchanged source must reuse exact bytes");
	assert.deepEqual(first.buffer, second.buffer);
	second.buffer[0] ^= 0xff;
	const third = buildInstallerComponents();
	assert.equal(hash(third.buffer), first.sha256, "mutable copy must not poison cache");
	assert.equal(first.files, COMPONENTS.length);
	assert.ok(first.files >= 69);
	assert.equal(hash(first.buffer), first.sha256);

	const archive = path.join(destination, "components.tar.gz");
	const extracted = path.join(destination, "extracted");
	fs.writeFileSync(archive, first.buffer);
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
	for (const helper of recoveryHelpers) {
		assert.ok(COMPONENTS.includes(helper), `missing recovery helper: ${helper}`);
	}
	for (const required of [
		"unix-install-sources.sh",
		"unix-candidate-probe.sh",
		"unix-activation-promotion.sh",
		"unix-emergency-capture.sh",
		"unix-supervisor-identity.sh",
		"unix-service-cli.sh",
		...recoveryHelpers
	]) {
		assert.ok(COMPONENTS.includes(required), `missing component: ${required}`);
	}
	assert.equal(COMPONENTS.includes("unix-bootstrap-components-download.sh"), false);

	const bootstrap = read("unix.sh");
	const runner = read("unix-bootstrap-run.sh");
	const components = read("unix-bootstrap-components.sh");
	const downloader = read("unix-bootstrap-components-download.sh");
	assert.match(bootstrap, /unix-bootstrap-run\.sh/);
	assert.match(bootstrap, /exec \/bin\/bash "\$run_script"/);
	for (const name of [
		"unix-node-runtime.sh",
		"unix-bootstrap-components.sh",
		"unix-bootstrap-components-download.sh"
	]) {
		assert.match(runner, new RegExp(`fetch_bootstrap_file ${name.replaceAll(".", "\\.")}`));
	}
	assert.match(components, /unix-bootstrap-components-download\.sh/);
	assert.match(downloader, /installer-components\.tar\.gz/);
	assert.match(downloader, /Using cached verified installer components/);
	assert.match(downloader, /Using compatible component download fallback/);
	assert.match(downloader, /file_sha256/);

	console.log(JSON.stringify({
		ok: true,
		suite: "installer-component-bundle",
		files: first.files,
		bytes: first.bytes,
		sha256: first.sha256,
		bufferCopiesIsolated: true,
		recoveryHelpers: recoveryHelpers.length
	}));
} finally {
	fs.rmSync(destination, { recursive: true, force: true });
}
