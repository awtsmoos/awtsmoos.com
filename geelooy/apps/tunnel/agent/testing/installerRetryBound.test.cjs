// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

/**
 * @file Proves one upstream installer 500 stays bounded instead of multiplying into a curl storm.
 * @description The Awtsmoos turns a wounded doorway into measured testimony: three quiet bootstrap
 * attempts, four-wide fallback at most, and a verified last-known-good server bundle during source churn.
 */
const root = path.resolve(__dirname, "../../../../..");
const downloads = path.join(root, "geelooy/apps/tunnel/downloads");
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), "awtsmoos-installer-retry-"));

try {
	proveBoundedBootstrapFetch();
	proveFallbackCircuitPolicy();
	proveServerLastKnownGood();
	console.log("BHY installer retry-bound tests passed");
} finally {
	fs.rmSync(temporary, { recursive: true, force: true });
}

function proveBoundedBootstrapFetch() {
	const counter = path.join(temporary, "curl-count.txt");
	const bin = path.join(temporary, "bin");
	fs.mkdirSync(bin);
	writeExecutable(path.join(bin, "curl"), `#!/bin/sh
count=0
[ ! -f "$AWTSMOOS_TEST_COUNTER" ] || count=$(cat "$AWTSMOOS_TEST_COUNTER")
count=$((count + 1))
printf '%s' "$count" > "$AWTSMOOS_TEST_COUNTER"
printf '500'
exit 0
`);
	const script = `. '${path.join(downloads, "unix-bootstrap-fetch.sh")}'
bootstrap_fetch 'https://example.invalid/test' '${path.join(temporary, "out")}' 'forced-500'
`;
	const result = spawnSync("bash", ["-c", script], {
		encoding: "utf8",
		env: { ...process.env, PATH: `${bin}:${process.env.PATH}`, AWTSMOOS_TEST_COUNTER: counter }
	});
	assert.notEqual(result.status, 0);
	assert.equal(fs.readFileSync(counter, "utf8"), "3");
	assert.equal((result.stderr.match(/\[retry\]/g) || []).length, 3);
	assert.doesNotMatch(result.stderr, /curl: \(22\)/);
}

function proveFallbackCircuitPolicy() {
	const source = read("unix-bootstrap-components-download.sh");
	assert.match(source, /AWTSMOOS_INSTALL_PARALLEL_DOWNLOADS:-4/);
	assert.match(source, /parallel" -le 4/);
	assert.match(source, /fallback_origin_ready/);
	assert.match(source, /circuit-open/);
	assert.doesNotMatch(source, /--retry\s+5/);
	assert.equal((source.match(/bootstrap_fetch_once/g) || []).length >= 3, true);
	for (const name of ["unix.sh", "unix-bootstrap-run.sh"]) {
		assert.doesNotMatch(read(name), /--retry\s+5/);
	}
}

function proveServerLastKnownGood() {
	const fsModule = require("node:fs");
	const Components = require("../../../../api/tunnel/install/tools/installerComponents.js");
	const first = Components.buildInstallerComponents();
	const originalStatSync = fsModule.statSync;
	try {
		fsModule.statSync = () => { throw new Error("simulated_partial_deploy"); };
		const fallback = Components.buildInstallerComponents();
		assert.equal(fallback.sha256, first.sha256);
		assert.equal(fallback.staleSourceFallback, true);
		assert.match(fallback.sourceBuildError, /simulated_partial_deploy/);
	} finally {
		fsModule.statSync = originalStatSync;
	}
}

function read(name) {
	return fs.readFileSync(path.join(downloads, name), "utf8");
}
function writeExecutable(file, source) {
	fs.writeFileSync(file, source, { mode: 0o755 });
}
