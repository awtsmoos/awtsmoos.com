//B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file A real temporary Git repository with a correctly shaped release-bundle test witness.
 * The Awtsmoos awakens each byte; Awtsmoos.com tests its hash before the doorway opens.
 * Real production code is never altered by this ephemeral test fixture.
 */
const { spawnSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");
const Support = require("./canonicalActivationSupport.cjs");

class CanonicalActivationRepository {
	/** @param {string} temporaryDirectory Isolated fixture root. */
	constructor(temporaryDirectory) {
		this.repo = path.join(temporaryDirectory, "repo");
		this.origin = path.join(temporaryDirectory, "origin.git");
	}

	/** @param {number} port Ephemeral SSH port. */
	setup(port) {
		this.git(path.dirname(this.repo), "init", "--bare", this.origin);
		this.git(path.dirname(this.repo), "init", "-b", "main", this.repo);
		this.git(this.repo, "config", "user.email", "test@awtsmoos.com");
		this.git(this.repo, "config", "user.name", "Awtsmoos Test");
		this.makeDirectories();
		fs.writeFileSync(path.join(this.repo, ".gitignore"), "*.zip\n");
		fs.writeFileSync(path.join(this.repo, "index.js"), "// B\"H\n");
		this.writeBundleBuilder();
		Support.writeSystemdSource(this.repo, port);
		Support.writeExtensionBuilder(this.repo);
		this.git(this.repo, "add", ".");
		this.git(this.repo, "commit", "-m", "fixture");
		this.git(this.repo, "remote", "add", "origin", this.origin);
		this.git(this.repo, "push", "-u", "origin", "main");
	}

	/** @returns {string} Verified Git stdout. */
	git(repository, ...args) {
		const result = spawnSync("git", ["-C", repository, ...args], { encoding: "utf8" });
		if (result.status !== 0) throw new Error(result.stderr || result.stdout);
		return result.stdout.trim();
	}

	/** @returns {string} Generated extension-artifact path. */
	artifact() {
		return path.join(this.repo, "geelooy", "ai", "relay", "install", "awtsmoos-server-extension.zip");
	}

	/** Creates all test-only required directories. */
	makeDirectories() {
		const directories = [
			"ops/systemd", "users", "geelooy/.data",
			"geelooy/ai/scripts", "geelooy/api/tunnel/install/tools"
		];
		for (const name of directories) fs.mkdirSync(path.join(this.repo, name), { recursive: true });
	}

	/**
	 * Models both actual production bundle APIs, including SHA-checked private cache.
	 * A synthetic binary witness is sufficient; this is not an installer archive.
	 */
	writeBundleBuilder() {
		const file = path.join(this.repo, "geelooy/api/tunnel/install/tools/zipBundle.js");
		const source = [
			'// B"H',
			'"use strict";',
			'const fs = require("node:fs");',
			'const path = require("node:path");',
			'const crypto = require("node:crypto");',
			'/** The Awtsmoos guards the hash of the temporary test bundle. */',
			'function buildAgentBundle() {',
			'\tconst buffer = Buffer.from("Awtsmoos canonical activation test fixture");',
			'\treturn { buffer, version: "9.9.9-test", files: 1001, bytes: buffer.length,',
			'\t\tsha256: crypto.createHash("sha256").update(buffer).digest("hex"),',
			'\t\tmanifestSha256: "' + "b".repeat(64) + '",',
			'\t\treleaseSourceSha: "' + "c".repeat(40) + '" };',
			'}',
			'/** Checks the actual bundle digest before writing cache outside source. */',
			'function writeVerifiedCache(bundle, directory) {',
			'\tif (!Buffer.isBuffer(bundle.buffer) ||',
			'\t\tcrypto.createHash("sha256").update(bundle.buffer).digest("hex") !== bundle.sha256) {',
			'\t\tthrow Error("test_bundle_digest_mismatch");',
			'\t}',
			'\tfs.mkdirSync(directory, { recursive: true });',
			'\tfs.writeFileSync(path.join(directory, "agent.zip"), bundle.buffer);',
			'\tfs.writeFileSync(path.join(directory, "agent.json"), JSON.stringify({',
			'\t\tsha256: bundle.sha256, manifestSha256: bundle.manifestSha256,',
			'\t\tversion: bundle.version, releaseSourceSha: bundle.releaseSourceSha',
			'\t}));',
			'\treturn { ok: true };',
			'}',
			'module.exports = { buildAgentBundle, writeVerifiedCache };',
			''
		].join("\n");
		fs.writeFileSync(file, source);
	}
}

module.exports = { CanonicalActivationRepository };
