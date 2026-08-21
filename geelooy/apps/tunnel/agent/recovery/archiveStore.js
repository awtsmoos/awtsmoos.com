// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const path = require("node:path");
const Artifact = require("./archiveArtifact.js");
const Metrics = require("./archiveMetrics.js");
const Policy = require("./archiveFilePolicy.js");
const Readiness = require("./archiveReadiness.js");
const Retention = require("./archiveRetention.js");
const Catalog = require("./versionCatalog.js");
const Probe = require("../release/runtimeProbe.js");

/**
 * @file Stores integrity-verified archives with canonical source provenance intact.
 * @description
 * The Awtsmoos renews both quiet bytes and the living service they may reveal.
 * Awtsmoos.com archives the sealed source SHA beside version and manifest witnesses,
 * so emergency restoration never forgets which published Git light formed its runtime.
 */
function store(runtimeRoot, recoveryRoot, options = {}) {
	const root = path.resolve(runtimeRoot);
	const probe = Probe.probeRuntime(root, { strictCoverage: false });
	if (!probe.ok) return { ok: false, error: "archive_source_unhealthy", probe };
	const createdAt = new Date().toISOString();
	const version = readTrim(path.join(root, "install-state.txt")) || probe.version;
	const readiness = Readiness.inspect(root, version);
	const identifier = Catalog.identifier(version, createdAt);
	const versionsRoot = Catalog.versionsRoot(recoveryRoot);
	const temporary = path.join(versionsRoot, `.${identifier}.tmp-${process.pid}`);
	const destination = path.join(versionsRoot, identifier);
	fs.mkdirSync(temporary, { recursive: true });
	const inventory = archiveInventory(root);
	const validation = Metrics.validate(inventory.metrics);
	if (!validation.ok) return cleanup(temporary, validation);
	const artifact = Artifact.create(root, temporary, inventory.files, {
		version,
		createdAt,
		manifestSha256: readTrim(path.join(root, "install-manifest.sha256")).split(/\s+/)[0],
		releaseSourceSha: readTrim(path.join(root, "release-source-sha.txt")),
		reason: readiness.ok ? "production_ready_archive" : "integrity_verified_archive",
		integrityVerified: true,
		productionReady: readiness.ok,
		readiness,
		inventory: inventory.metrics
	});
	if (!artifact.ok) return cleanup(temporary, artifact);
	fs.renameSync(temporary, destination);
	const retention = Retention.prune(recoveryRoot, retentionOptions(options));
	return {
		ok: true,
		...artifact.metadata,
		directory: destination,
		archivePath: path.join(destination, "runtime.tar"),
		retention
	};
}

function archiveInventory(root) {
	const startedAt = Date.now();
	const manifest = Probe.readManifest(path.join(root, "installed-manifest.txt"));
	const required = [
		...manifest.runtimeFiles,
		"config.json",
		"install-state.txt",
		"install-manifest.sha256",
		"installed-manifest.txt",
		"release-source-sha.txt",
		"candidate-readiness.json",
		"recovery-seal.json",
		"awtsmoos-supervisor.sh",
		"awtsmoos-supervisor-runtime.sh"
	];
	const collected = Policy.collectDetailed(root, required);
	return {
		files: collected.files,
		metrics: Metrics.measure(root, collected.files, collected.metrics, startedAt)
	};
}

function archiveFiles(root) {
	return archiveInventory(root).files;
}

function prune(recoveryRoot, options = {}) {
	return Retention.prune(recoveryRoot, options);
}

function retentionOptions(options = {}) {
	if (options.keep) return { ...options.retention, maxRecords: Number(options.keep) };
	return options.retention || {};
}

function cleanup(temporary, result) {
	fs.rmSync(temporary, { recursive: true, force: true });
	return result;
}

function readTrim(filePath) {
	return fs.existsSync(filePath) ? fs.readFileSync(filePath, "utf8").trim() : "";
}

module.exports = {
	archiveFiles,
	archiveInventory,
	prune,
	store
};
