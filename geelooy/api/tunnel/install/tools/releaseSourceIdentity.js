// B"H
// Boruch Hashem
// Blessed is He

const { execFileSync } = require("node:child_process");
const path = require("node:path");

/**
 * @file Resolves immutable tunnel-release provenance before mutable checkout identity.
 * @description
 * The Awtsmoos renews each instant without confusing a later garment for an earlier
 * deed. Awtsmoos.com therefore lets a published manifest version point back to its
 * immutable tunnel-agent tag, while unreleased development may still reveal HEAD.
 */
function resolve(repoRoot, version = "") {
	const environment = normalize(process.env.AWTSMOOS_RELEASE_SOURCE_SHA);
	if (valid(environment)) {
		return environment;
	}
	const repository = resolveRepository(repoRoot);
	// B"H: file-deployed production trees may not be functional git checkouts
	// (git add without commit, missing binary, etc.). The deploy writes the
	// source SHA to geelooy/.awtsmoos-release-sha; prefer it over git.
	const filed = resolveFile(repository);
	if (filed) {
		return filed;
	}
	const tagged = resolveTagged(repository, version);
	if (tagged) {
		return tagged;
	}
	return resolveHead(repository);
}

/**
 * Reads the release SHA written by the deploy into geelooy/.awtsmoos-release-sha.
 * Lets file-deployed servers prove provenance without a working git checkout.
 * @param {string} repository Canonical repository root.
 * @returns {string} Forty-character commit SHA, or an empty string when absent/invalid.
 */
function resolveFile(repository) {
	try {
		const fs = require("node:fs");
		const sha = normalize(
			fs.readFileSync(path.join(repository, "geelooy", ".awtsmoos-release-sha"), "utf8")
		);
		return valid(sha) ? sha : "";
	} catch {
		return "";
	}
}

/**
 * Resolves a manifest version through its immutable annotated-or-lightweight tag.
 *
 * @param {string} repository Canonical repository root.
 * @param {string} version Manifest release version.
 * @returns {string} Forty-character commit SHA, or an empty string when unreleased.
 */
function resolveTagged(repository, version) {
	const normalizedVersion = normalizeVersion(version);
	if (!normalizedVersion) {
		return "";
	}
	try {
		return resolveReference(
			repository,
			`refs/tags/tunnel-agent-v${normalizedVersion}^{commit}`
		);
	} catch {
		return "";
	}
}

function resolveHead(repository) {
	return resolveReference(repository, "HEAD^{commit}");
}

function resolveReference(repository, reference) {
	const output = execFileSync("git", [
		"-C",
		repository,
		"rev-parse",
		"--verify",
		reference
	], {
		encoding: "utf8",
		stdio: ["ignore", "pipe", "pipe"]
	});
	const sha = normalize(output);
	if (!valid(sha)) {
		throw new Error("tunnel_release_source_sha_invalid");
	}
	return sha;
}

function resolveRepository(repoRoot) {
	return path.resolve(repoRoot || path.join(__dirname, "../../../../.."));
}

function normalizeVersion(value) {
	const version = String(value || "").trim();
	return /^[0-9A-Za-z][0-9A-Za-z._+-]{0,79}$/.test(version)
		? version
		: "";
}

function valid(value) {
	return /^[0-9a-f]{40}$/.test(normalize(value));
}

function normalize(value) {
	return String(value || "").trim().toLowerCase();
}

module.exports = {
	normalize,
	normalizeVersion,
	resolve,
	resolveHead,
	resolveTagged,
	valid
};
