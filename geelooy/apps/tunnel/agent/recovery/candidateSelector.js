// B"H
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const ArchiveSafety = require("./archiveSafety.js");
const Catalog = require("./versionCatalog.js");
const Probe = require("../release/runtimeProbe.js");

/**
 * B"H — The newest archive is a preference, never an idol. Hash, path safety,
 * extraction, and startup imports must all agree before an older world may rise.
 */
function select(options) {
	const recoveryRoot = path.resolve(options.recoveryRoot);
	const stageRoot = path.resolve(options.stageRoot);
	const candidates = [...Catalog.list(recoveryRoot), ...Catalog.legacy(recoveryRoot)];
	const attempts = [];

	for (const candidate of candidates) {
		const attempt = stageCandidate(candidate, stageRoot, options.configPath);
		attempts.push({ version: candidate.version, ...attempt });
		if (attempt.ok) {
			return { ok: true, candidate, stageRoot, attempts, probe: attempt.probe };
		}
	}

	return { ok: false, error: "no_healthy_recovery_candidate", attempts };
}

function stageCandidate(candidate, stageRoot, configPath) {
	fs.rmSync(stageRoot, { recursive: true, force: true });
	fs.mkdirSync(stageRoot, { recursive: true });

	if (candidate.archiveSha256 && sha256(candidate.archivePath) !== candidate.archiveSha256) {
		return { ok: false, error: "archive_hash_mismatch" };
	}

	const safety = ArchiveSafety.inspect(candidate.archivePath);
	if (!safety.ok) {
		return safety;
	}

	const extract = spawnSync("tar", ["-xf", candidate.archivePath, "-C", stageRoot], {
		encoding: "utf8",
		timeout: 30000
	});
	if (extract.status !== 0) {
		return { ok: false, error: "archive_extract_failed", stderr: extract.stderr };
	}

	if (configPath && fs.existsSync(configPath)) {
		fs.copyFileSync(configPath, path.join(stageRoot, "config.json"));
	}

	const probe = Probe.probeRuntime(stageRoot, { strictCoverage: false });
	return probe.ok
		? { ok: true, probe, archiveEntries: safety.entries }
		: { ok: false, error: probe.error, probe };
}

function sha256(filePath) {
	return crypto.createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
}

module.exports = { select, stageCandidate };
