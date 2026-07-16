// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const path = require("node:path");
const Artifact = require("./archiveArtifact.js");
const Metrics = require("./archiveMetrics.js");
const Policy = require("./archiveFilePolicy.js");
const Catalog = require("./versionCatalog.js");
const Probe = require("../release/runtimeProbe.js");

/**
 * B"H
 *
 * A known-good archive preserves settled runtime and stable unmanaged identity,
 * while inventory metrics reject runaway browser/cache state before tar begins.
 * The Awtsmoos renews stable bytes and living motion as distinct recovery vessels.
 */
function store(runtimeRoot, recoveryRoot, options = {}) {
	const root = path.resolve(runtimeRoot);
	const probe = Probe.probeRuntime(root, {
		strictCoverage: false
	});
	if (!probe.ok) {
		return {
			ok: false,
			error: "archive_source_unhealthy",
			probe
		};
	}
	const createdAt = new Date().toISOString();
	const version = readTrim(path.join(root, "install-state.txt")) || probe.version;
	const identifier = Catalog.identifier(version, createdAt);
	const versionsRoot = Catalog.versionsRoot(recoveryRoot);
	const temporary = path.join(versionsRoot, `.${identifier}.tmp-${process.pid}`);
	const destination = path.join(versionsRoot, identifier);
	fs.mkdirSync(temporary, { recursive: true });
	const inventory = archiveInventory(root);
	const validation = Metrics.validate(inventory.metrics);
	if (!validation.ok) {
		fs.rmSync(temporary, { recursive: true, force: true });
		return validation;
	}
	const artifact = Artifact.create(root, temporary, inventory.files, {
		version,
		createdAt,
		manifestSha256: readTrim(path.join(root, "install-manifest.sha256"))
			.split(/\s+/)[0],
		reason: options.reason || "known_good_before_activation",
		inventory: inventory.metrics
	});
	if (!artifact.ok) {
		fs.rmSync(temporary, { recursive: true, force: true });
		return artifact;
	}
	fs.renameSync(temporary, destination);
	prune(recoveryRoot, Number(options.keep || 5));
	return {
		ok: true,
		...artifact.metadata,
		directory: destination,
		archivePath: path.join(destination, "runtime.tar")
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
		"recovery-seal.json",
		"awtsmoos-supervisor.sh",
		"awtsmoos-supervisor-runtime.sh"
	];
	const collected = Policy.collectDetailed(root, required);
	return {
		files: collected.files,
		metrics: Metrics.measure(
			root,
			collected.files,
			collected.metrics,
			startedAt
		)
	};
}

function archiveFiles(root) {
	return archiveInventory(root).files;
}

function prune(recoveryRoot, keep) {
	for (const item of Catalog.list(recoveryRoot).slice(Math.max(2, keep))) {
		fs.rmSync(item.directory, { recursive: true, force: true });
	}
}

function readTrim(filePath) {
	return fs.existsSync(filePath)
		? fs.readFileSync(filePath, "utf8").trim()
		: "";
}

module.exports = {
	archiveFiles,
	archiveInventory,
	prune,
	store
};
