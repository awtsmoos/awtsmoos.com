// B"H
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const Catalog = require("./versionCatalog.js");
const Probe = require("../release/runtimeProbe.js");

/**
 * B"H — Only a runtime that can load its own startup graph may enter memory.
 * Logs, profiles, and queues stay outside; both supervisor vessels remain inside.
 */
function store(runtimeRoot, recoveryRoot, options = {}) {
	const root = path.resolve(runtimeRoot);
	const probe = Probe.probeRuntime(root, { strictCoverage: false });
	if (!probe.ok) return { ok: false, error: "archive_source_unhealthy", probe };

	const createdAt = new Date().toISOString();
	const version = readTrim(path.join(root, "install-state.txt")) || probe.version;
	const identifier = Catalog.identifier(version, createdAt);
	const versionsRoot = Catalog.versionsRoot(recoveryRoot);
	const temporary = path.join(versionsRoot, `.${identifier}.tmp-${process.pid}`);
	const destination = path.join(versionsRoot, identifier);
	fs.mkdirSync(temporary, { recursive: true });

	const files = archiveFiles(root);
	const archivePath = path.join(temporary, "runtime.tar");
	const tar = spawnSync("tar", ["-cf", archivePath, "-C", root, ...files], {
		encoding: "utf8",
		timeout: 60000
	});
	if (tar.status !== 0) {
		fs.rmSync(temporary, { recursive: true, force: true });
		return { ok: false, error: "archive_create_failed", stderr: tar.stderr };
	}

	const metadata = {
		version,
		createdAt,
		manifestSha256: readTrim(path.join(root, "install-manifest.sha256")).split(/\s+/)[0],
		archiveSha256: sha256(archivePath),
		files: files.length,
		reason: options.reason || "known_good_before_activation"
	};
	fs.writeFileSync(
		path.join(temporary, "metadata.json"),
		`${JSON.stringify(metadata, null, 2)}\n`
	);
	fs.renameSync(temporary, destination);
	prune(recoveryRoot, Number(options.keep || 5));
	return {
		ok: true,
		...metadata,
		directory: destination,
		archivePath: path.join(destination, "runtime.tar")
	};
}

function archiveFiles(root) {
	const manifest = Probe.readManifest(path.join(root, "installed-manifest.txt"));
	const optional = [
		"config.json",
		"install-state.txt",
		"install-manifest.sha256",
		"installed-manifest.txt",
		"recovery-seal.json",
		"awtsmoos-supervisor.sh",
		"awtsmoos-supervisor-runtime.sh"
	];
	return [...new Set([...manifest.runtimeFiles, ...optional])]
		.filter(relative => fs.existsSync(path.join(root, relative)));
}

function prune(recoveryRoot, keep) {
	for (const item of Catalog.list(recoveryRoot).slice(Math.max(2, keep))) {
		fs.rmSync(item.directory, { recursive: true, force: true });
	}
}

function sha256(filePath) {
	return crypto.createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
}

function readTrim(filePath) {
	return fs.existsSync(filePath) ? fs.readFileSync(filePath, "utf8").trim() : "";
}

module.exports = { archiveFiles, prune, store };
