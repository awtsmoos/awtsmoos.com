// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

/**
 * B"H
 *
 * The real Unix bootstrap list generator must load the verified candidate policy,
 * preserve stable unmanaged predecessor bytes, and exclude transient runtime state.
 */
const tunnelRoot = path.resolve(__dirname, "../..");
const scriptPath = path.join(
	tunnelRoot,
	"downloads/unix-recovery-archive-list.sh"
);
const policySource = path.join(
	tunnelRoot,
	"agent/recovery/archiveFilePolicy.js"
);
const temporaryRoot = fs.mkdtempSync(
	path.join(os.tmpdir(), "awts-unix-archive-list-")
);
const runtimeRoot = path.join(temporaryRoot, "runtime");
const candidateRoot = path.join(temporaryRoot, "candidate");
const outputPath = path.join(temporaryRoot, "files.txt");

try {
	writeRuntimeFixture();
	installCandidatePolicy();
	const result = spawnSync("bash", [
		"-lc",
		'source "$ARCHIVE_SCRIPT"; install_event(){ :; }; write_archive_file_list "$OUTPUT"'
	], {
		env: {
			...process.env,
			ARCHIVE_SCRIPT: scriptPath,
			CANDIDATE_ROOT: candidateRoot,
			OUTPUT: outputPath,
			ROOT: runtimeRoot
		},
		encoding: "utf8",
		timeout: 10000
	});
	assert.equal(result.status, 0, result.stderr || result.stdout);
	const files = fs.readFileSync(outputPath, "utf8")
		.trim()
		.split(/\r?\n/);
	assert.equal(files.includes("main.js"), true);
	assert.equal(files.includes("sentinel.txt"), true);
	assert.equal(files.includes("custom/stable.json"), true);
	assert.equal(files.includes("connection-state.json"), false);
	assert.equal(files.includes("agent.log"), false);
	assert.equal(files.some(file => file.startsWith("device-state/")), false);
	console.log(JSON.stringify({
		ok: true,
		suite: "unix-archive-list-stable-identity",
		candidatePolicyLoaded: true,
		stableUnmanagedPreserved: true,
		transientStateExcluded: true,
		files: files.length
	}, null, 2));
} finally {
	fs.rmSync(temporaryRoot, {
		recursive: true,
		force: true
	});
}

function writeRuntimeFixture() {
	write("installed-manifest.txt", [
		'B"H',
		"1.0.100",
		"main.js",
		"lib/stable.js",
		""
	].join("\n"));
	write("main.js", "// B\"H\n");
	write("lib/stable.js", "// stable\n");
	write("sentinel.txt", "older-runtime\n");
	write("custom/stable.json", "{\"stable\":true}\n");
	write("connection-state.json", "{}\n");
	write("agent.log", "transient\n");
	write("device-state/jobs/job.json", "{}\n");
}

function installCandidatePolicy() {
	const target = path.join(
		candidateRoot,
		"recovery/archiveFilePolicy.js"
	);
	fs.mkdirSync(path.dirname(target), {
		recursive: true
	});
	fs.copyFileSync(policySource, target);
}

function write(relative, content) {
	const target = path.join(runtimeRoot, relative);
	fs.mkdirSync(path.dirname(target), {
		recursive: true
	});
	fs.writeFileSync(target, content);
}
