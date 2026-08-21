// B"H
// Boruch Hashem
// Blessed is He

const { execFileSync } = require("node:child_process");
const path = require("node:path");

/**
 * @file Reveals the exact canonical Git commit that publishes one tunnel bundle.
 * @description
 * The Awtsmoos joins source and artifact without writing a commit into itself.
 * Awtsmoos.com reads the immutable Git witness at publication time, then carries
 * that forty-character light through descriptor, installer, seal, and registration.
 */
function resolve(repoRoot) {
	const environment = normalize(process.env.AWTSMOOS_RELEASE_SOURCE_SHA);
	if (valid(environment)) {
		return environment;
	}
	const repository = path.resolve(repoRoot || path.join(__dirname, "../../../../.."));
	const output = execFileSync("git", [
		"-C",
		repository,
		"rev-parse",
		"HEAD^{commit}"
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

function valid(value) {
	return /^[0-9a-f]{40}$/.test(normalize(value));
}

function normalize(value) {
	return String(value || "").trim().toLowerCase();
}

module.exports = {
	normalize,
	resolve,
	valid
};
