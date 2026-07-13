// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const ArchiveRestore = require("../recovery/archiveRestore.js");
const ArchiveStore = require("../recovery/archiveStore.js");
const RuntimeProbe = require("../release/runtimeProbe.js");
const { buildAgentBundle } = require("../../../../api/tunnel/install/tools/zipBundle.js");

/**
 * B"H
 *
 * Creates two immutable known-good versions, corrupts the newest archive, and
 * requires recovery to pass over it for the older healthy vessel. This is the
 * exact Gevurah that was absent during the July failure on Awtsmoos.com.
 */
const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), "awts-version-fallback-"));
const liveRoot = path.join(temporaryRoot, "live");
const recoveryRoot = path.join(temporaryRoot, "recovery");

try {
	installCurrentBundle(liveRoot);
	writeReceipts(liveRoot, "1.0.286");
	const older = ArchiveStore.store(liveRoot, recoveryRoot, {
		reason: "older_known_good",
		keep: 5
	});
	assert.equal(older.ok, true, JSON.stringify(older));

	writeReceipts(liveRoot, "1.0.287");
	const newer = ArchiveStore.store(liveRoot, recoveryRoot, {
		reason: "newer_known_good_before_corruption",
		keep: 5
	});
	assert.equal(newer.ok, true, JSON.stringify(newer));

	setCreatedAt(older.directory, "2026-07-12T00:00:00.000Z");
	setCreatedAt(newer.directory, "2026-07-13T00:00:00.000Z");
	fs.appendFileSync(newer.archivePath, "corruption");

	const preservedConfig = {
		tunnelName: "awt-recovery-fallback-test",
		root: "/tmp/recovery-project"
	};
	fs.writeFileSync(
		path.join(liveRoot, "config.json"),
		`${JSON.stringify(preservedConfig, null, 2)}\n`
	);
	fs.rmSync(path.join(liveRoot, "lib", "local-api.js"));

	const result = ArchiveRestore.restore(liveRoot, 0, recoveryRoot);
	assert.equal(result.ok, true, JSON.stringify(result));
	assert.equal(result.version, "1.0.286");
	assert.equal(result.attempts[0].error, "archive_hash_mismatch");
	assert.equal(result.attempts[1].ok, true);

	const probe = RuntimeProbe.probeRuntime(liveRoot, { strictCoverage: false });
	assert.equal(probe.ok, true, JSON.stringify(probe));
	assert.deepEqual(
		JSON.parse(fs.readFileSync(path.join(liveRoot, "config.json"), "utf8")),
		preservedConfig
	);

	console.log(JSON.stringify({
		ok: true,
		suite: "version-recovery-fallback",
		restoredVersion: result.version,
		attempts: result.attempts.map(attempt => ({
			version: attempt.version,
			ok: attempt.ok,
			error: attempt.error || ""
		}))
	}, null, 2));
} finally {
	fs.rmSync(temporaryRoot, { recursive: true, force: true });
}

function installCurrentBundle(destination) {
	const repositoryRoot = path.resolve(__dirname, "../../../../..");
	const bundle = buildAgentBundle(repositoryRoot);
	const zipPath = path.join(temporaryRoot, "agent.zip");
	fs.mkdirSync(destination, { recursive: true });
	fs.writeFileSync(zipPath, bundle.buffer);
	const extract = spawnSync("unzip", ["-oq", zipPath, "-d", destination], {
		encoding: "utf8"
	});
	assert.equal(extract.status, 0, extract.stderr);
}

function writeReceipts(destination, version) {
	const sourceManifest = path.resolve(__dirname, "../manifest.txt");
	const manifestText = fs.readFileSync(sourceManifest, "utf8");
	fs.writeFileSync(path.join(destination, "installed-manifest.txt"), manifestText);
	fs.writeFileSync(path.join(destination, "install-state.txt"), `${version}\n`);
	fs.writeFileSync(path.join(destination, "install-manifest.sha256"), `${version}-hash\n`);
	fs.writeFileSync(path.join(destination, "config.json"), "{\"tunnelName\":\"awt-archive-source\"}\n");
}

function setCreatedAt(directory, createdAt) {
	const metadataPath = path.join(directory, "metadata.json");
	const metadata = JSON.parse(fs.readFileSync(metadataPath, "utf8"));
	metadata.createdAt = createdAt;
	fs.writeFileSync(metadataPath, `${JSON.stringify(metadata, null, 2)}\n`);
}
