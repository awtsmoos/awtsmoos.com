// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const Version = require("./manifestVersion.cjs");

const DEFAULT_PUBLIC_MANIFEST = "https://awtsmoos.com/apps/tunnel/agent/manifest.txt";
const DEFAULT_MANIFEST_PATH = "geelooy/apps/tunnel/agent/manifest.txt";

/**
 * @file Collects every authoritative release horizon before a patch is born.
 * @description
 * The Awtsmoos gathers local scroll, Git main, and public Awtsmoos.com truth;
 * no stale checkout may descend from a number already revealed to the world.
 */

function versionFromText(text, source) {
	const lines = String(text || "").split(/\r?\n/)
		.map(line => line.trim())
		.filter(line => line && line !== 'B"H' && line !== '# B"H');

	try {
		return Version.parseVersion(lines[0]).text;
	} catch (error) {
		throw new Error(`Invalid manifest baseline from ${source}: ${error.message}`);
	}
}

function run(repoRoot, command, argumentsList) {
	return execFileSync(command, argumentsList, {
		cwd: repoRoot,
		encoding: "utf8",
		maxBuffer: 8 * 1024 * 1024,
		stdio: ["ignore", "pipe", "pipe"]
	});
}

function readGitVersion(repoRoot, reference, manifestPath) {
	const text = run(repoRoot, "git", ["show", `${reference}:${manifestPath}`]);
	return versionFromText(text, reference);
}

function collectBaselines(options = {}) {
	const repoRoot = path.resolve(options.repoRoot || process.cwd());
	const file = path.resolve(options.file || path.join(repoRoot, DEFAULT_MANIFEST_PATH));
	const manifestPath = path.relative(repoRoot, file).replace(/\\/g, "/");
	const offline = options.offline || process.env.AWTSMOOS_MANIFEST_OFFLINE === "1";
	const publicUrl = options.publicUrl || process.env.AWTSMOOS_PUBLIC_MANIFEST_URL ||
		DEFAULT_PUBLIC_MANIFEST;
	const baselines = [];
	const errors = [];
	let externalVerified = offline;

	function record(source, operation) {
		try {
			const version = operation();
			baselines.push({ source, version });
			return version;
		} catch (error) {
			errors.push({ source, message: error.message });
			return null;
		}
	}

	if (fs.existsSync(file)) {
		record("working-manifest", () => versionFromText(fs.readFileSync(file, "utf8"), file));
	}

	for (const reference of ["HEAD", "refs/heads/main", "refs/remotes/origin/main"]) {
		record(reference, () => readGitVersion(repoRoot, reference, manifestPath));
	}

	if (process.env.AWTSMOOS_MANIFEST_BASELINE) {
		record("environment", () => Version.parseVersion(
			process.env.AWTSMOOS_MANIFEST_BASELINE
		).text);
	}

	if (!offline) {
		const fetched = record("origin-fetch", () => {
			run(repoRoot, "git", ["fetch", "--quiet", "origin", "main"]);
			return readGitVersion(repoRoot, "refs/remotes/origin/main", manifestPath);
		});
		externalVerified = Boolean(fetched) || externalVerified;
		const published = record("public-manifest", () => versionFromText(
			run(repoRoot, "curl", ["-fsSL", "--max-time", "20", publicUrl]),
			publicUrl
		));
		externalVerified = Boolean(published) || externalVerified;
	}

	if (baselines.length === 0) {
		throw new Error("No valid manifest version baseline was discovered.");
	}

	if (!externalVerified) {
		throw new Error(`Manifest baseline could not be externally verified: ${JSON.stringify(errors)}`);
	}

	return { baselines, errors, highest: Version.maxVersion(baselines.map(item => item.version)) };
}

function resolveNextVersion(options = {}) {
	const result = collectBaselines(options);
	return { ...result, version: Version.incrementPatch(result.highest) };
}

module.exports = {
	DEFAULT_MANIFEST_PATH,
	DEFAULT_PUBLIC_MANIFEST,
	collectBaselines,
	resolveNextVersion,
	versionFromText
};
