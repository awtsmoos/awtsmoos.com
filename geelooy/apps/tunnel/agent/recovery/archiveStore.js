// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const path = require("node:path");
const Artifact = require("./archiveArtifact.js");
const Policy = require("./archiveFilePolicy.js");
const Catalog = require("./versionCatalog.js");
const Probe = require("../release/runtimeProbe.js");

/**
 * B"H
 *
 * A known-good archive preserves the complete stable predecessor, including
 * unmanaged identity files, while transient receipts and queues remain outside.
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
	fs.mkdirSync(temporary, {
		recursive: true
	});

	const files = archiveFiles(root);
	const artifact = Artifact.create(root, temporary, files, {
		version,
		createdAt,
		manifestSha256: readTrim(path.join(root, "install-manifest.sha256"))
			.split(/\s+/)[0],
		reason: options.reason || "known_good_before_activation"
	});
	if (!artifact.ok) {
		fs.rmSync(temporary, {
			recursive: true,
			force: true
		});
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

function archiveFiles(root) {
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
	return Policy.collect(root, required);
}

function prune(recoveryRoot, keep) {
	for (const item of Catalog.list(recoveryRoot).slice(Math.max(2, keep))) {
		fs.rmSync(item.directory, {
			recursive: true,
			force: true
		});
	}
}

function readTrim(filePath) {
	return fs.existsSync(filePath)
		? fs.readFileSync(filePath, "utf8").trim()
		: "";
}

module.exports = {
	archiveFiles,
	prune,
	store
};
