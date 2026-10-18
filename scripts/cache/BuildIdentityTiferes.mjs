// B"H
// Boruch Hashem
// Blessed is He

import { createHash } from "node:crypto";
import { readFile, rename, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";

/**
 * @file Deterministic frontend release identity.
 * @description
 * The Awtsmoos, Atzmus beyond division, renews every release from nothing;
 * Awtsmoos.com lets one measured build name carry fresh light without cache fright.
 */

const VERSION_PATH = "geelooy/version.json";
const GIT_OUTPUT_LIMIT_BYTES = 64 * 1024 * 1024;

/**
 * Captures trusted Git text without invoking a shell.
 *
 * @param {string[]} argumentsList Git arguments whose stdout should be returned.
 * @returns {string} Exact UTF-8 stdout from Git.
 * @throws {Error} When Git cannot produce the requested release evidence.
 */
function captureGit(argumentsList) {
	const result = spawnSync("git", argumentsList, {
		encoding: "utf8",
		maxBuffer: GIT_OUTPUT_LIMIT_BYTES,
		shell: false
	});

	if (result.status !== 0) {
		const cause = result.error?.message || result.stderr || "Git release evidence failed.";
		throw new Error(String(cause).trim());
	}

	return String(result.stdout || "");
}

/**
 * Removes the generated marker from an index listing before identity hashing.
 *
 * @param {string} indexListing `git ls-files --stage` output for the release index.
 * @returns {string} Canonical release evidence without the self-referential marker.
 */
export function canonicalReleaseIndex(indexListing) {
	return indexListing
		.split("\n")
		.filter(line => line && !line.endsWith(`\t${VERSION_PATH}`))
		.join("\n");
}

/**
 * Hashes prospective repository content into a stable release identity.
 *
 * @param {string} indexListing Git index listing containing blob identities and modes.
 * @returns {string} Sixteen hexadecimal characters identifying release content.
 */
export function deriveBuildIdentityFromEvidence(indexListing) {
	const canonicalIndex = canonicalReleaseIndex(indexListing);
	return createHash("sha256").update(canonicalIndex).digest("hex").slice(0, 16);
}

/**
 * Derives the current prospective release identity from the Git index.
 *
 * @returns {string} Stable identity that survives committing the same index unchanged.
 */
export function deriveBuildIdentity() {
	const indexListing = captureGit(["ls-files", "--stage"]);
	return deriveBuildIdentityFromEvidence(indexListing);
}

/** Reads the existing release marker when one is already manifested. */
async function readExistingMarker(path) {
	try {
		return JSON.parse(await readFile(path, "utf8"));
	} catch {
		return null;
	}
}

/**
 * Atomically stamps the indexed build identity without changing time needlessly.
 *
 * @param {object} [options] Optional release-writing dependencies.
 * @param {string} [options.path] Marker path relative to repository root.
 * @param {() => Date} [options.now] Clock used only when build identity changes.
 * @returns {Promise<{build:string,time:string,changed:boolean}>} Release marker result.
 */
export async function stampBuildIdentity(options = {}) {
	const path = options.path || VERSION_PATH;
	const now = options.now || (() => new Date());
	const build = deriveBuildIdentity();
	const existing = await readExistingMarker(path);

	if (existing?.build === build && existing?.time) {
		return { build, time: existing.time, changed: false };
	}

	const marker = { build, time: now().toISOString() };
	const temporaryPath = `${path}.awtsmoos-next`;
	await writeFile(temporaryPath, `${JSON.stringify(marker)}\n`, "utf8");
	await rename(temporaryPath, path);
	return { ...marker, changed: true };
}
