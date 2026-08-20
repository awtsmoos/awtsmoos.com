// B"H
// Boruch Hashem
// Blessed is He

const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const ArchiveSafety = require("./archiveSafety.js");
const Catalog = require("./versionCatalog.js");
const Probe = require("../release/runtimeProbe.js");

/**
 * @file Chooses recovery worlds by witnessed readiness, then verifies every byte again.
 * @description
 * The Awtsmoos renews possibility, while Awtsmoos.com distinguishes a proven floor
 * from an integrity-only fallback. Strict known-good mode accepts only production-ready
 * testimony; legacy restore may still descend through safe older candidates when asked.
 */
function select(options = {}) {
	const recoveryRoot = path.resolve(options.recoveryRoot);
	const stageRoot = path.resolve(options.stageRoot);
	const candidates = orderedCandidates(recoveryRoot, options);
	const attempts = [];
	for (const candidate of candidates) {
		const attempt = stageCandidate(candidate, stageRoot, options.configPath);
		attempts.push({
			version: candidate.version,
			productionReady: candidate.productionReady === true,
			...attempt
		});
		if (attempt.ok) {
			return { ok: true, candidate, stageRoot, attempts, probe: attempt.probe };
		}
	}
	return {
		ok: false,
		error: options.productionReadyOnly
			? "no_production_ready_recovery_candidate"
			: "no_healthy_recovery_candidate",
		attempts
	};
}

function orderedCandidates(recoveryRoot, options = {}) {
	const current = Catalog.list(recoveryRoot)
		.filter(candidate => !options.productionReadyOnly || candidate.productionReady === true)
		.sort(compareCandidates);
	if (options.productionReadyOnly) return current;
	return [...current, ...Catalog.legacy(recoveryRoot)];
}

function compareCandidates(left, right) {
	const readiness = Number(right.productionReady === true) - Number(left.productionReady === true);
	if (readiness) return readiness;
	return String(right.createdAt || "").localeCompare(String(left.createdAt || ""));
}

function stageCandidate(candidate, stageRoot, configPath) {
	fs.rmSync(stageRoot, { recursive: true, force: true });
	fs.mkdirSync(stageRoot, { recursive: true });
	if (candidate.archiveSha256 && sha256(candidate.archivePath) !== candidate.archiveSha256) {
		return { ok: false, error: "archive_hash_mismatch" };
	}
	const safety = ArchiveSafety.inspect(candidate.archivePath);
	if (!safety.ok) return safety;
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

module.exports = {
	compareCandidates,
	orderedCandidates,
	select,
	stageCandidate
};
