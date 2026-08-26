//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Lifecycle harness for canonical activation tests over an isolated Git universe.
 * @description
 * The Awtsmoos lets one temporary repository rehearse production without touching the
 * living host. Awtsmoos.com keeps Git truth, listener truth, execution, and cleanup in
 * this narrow vessel while smaller support modules shape its test garments in rhyme.
 */
const { spawnSync } = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const Support = require("./canonicalActivationSupport.cjs");

class CanonicalActivationFixture {
	/**
	 * Creates one isolated repository universe and its command-shim locations.
	 */
	constructor() {
		this.temporary = fs.mkdtempSync(
			path.join(os.tmpdir(), "awtsmoos-activate-")
		);
		this.repo = path.join(this.temporary, "repo");
		this.origin = path.join(this.temporary, "origin.git");
		this.bin = path.join(this.temporary, "bin");
		this.override = path.join(this.temporary, "override.conf");
		this.script = path.join(__dirname, "..", "canonical-server-activate.sh");
	}

	/**
	 * Builds and commits the fixture repository before exposing external command shims.
	 *
	 * @returns {void}
	 */
	setup() {
		this.git(this.temporary, "init", "--bare", this.origin);
		this.git(this.temporary, "init", "-b", "main", this.repo);
		this.git(this.repo, "config", "user.email", "test@awtsmoos.com");
		this.git(this.repo, "config", "user.name", "Awtsmoos Test");
		Support.makeRepositoryDirectories(this.repo);
		fs.writeFileSync(path.join(this.repo, ".gitignore"), "*.zip\n");
		fs.writeFileSync(path.join(this.repo, "index.js"), '// B"H\n');
		Support.writeSystemdSource(this.repo);
		Support.writeExtensionBuilder(this.repo);
		this.git(this.repo, "add", ".");
		this.git(this.repo, "commit", "-m", "fixture");
		this.git(this.repo, "remote", "add", "origin", this.origin);
		this.git(this.repo, "push", "-u", "origin", "main");
		Support.writeCommandShims(this.bin);
	}

	/**
	 * Executes canonical activation with selectable environment and socket witnesses.
	 *
	 * @param {string} sha Expected canonical commit SHA.
	 * @param {string[]} [environment] Simulated service environment.
	 * @param {object} [options={}] Runtime witness options.
	 * @returns {object} Synchronous child-process result.
	 */
	run(sha, environment = Support.VIRTUAL_SSH_ENVIRONMENT, options = {}) {
		return spawnSync("bash", [this.script, sha], {
			encoding: "utf8",
			env: {
				...process.env,
				PATH: `${this.bin}:${process.env.PATH}`,
				TEST_REPO: this.repo,
				TEST_SERVICE_ENVIRONMENT: environment.join(" "),
				TEST_VIRTUAL_SSH_LISTENER: options.listener === false ? "0" : "1",
				AWTSMOOS_PRODUCTION_REPO: this.repo,
				AWTSMOOS_SYSTEMD_OVERRIDE_PATH: this.override,
				TMPDIR: this.temporary
			}
		});
	}

	/** @returns {string} Trimmed stdout from a required-success Git invocation. */
	git(repository, ...args) {
		const result = spawnSync("git", ["-C", repository, ...args], { encoding: "utf8" });
		if (result.status !== 0) {
			throw new Error(result.stderr || result.stdout);
		}
		return result.stdout.trim();
	}

	/** @param {string} value Override sentinel or fixture content. @returns {void} */
	writeOverride(value) {
		fs.writeFileSync(this.override, value);
	}

	/** @returns {string} Expected generated extension artifact path. */
	artifact() {
		return path.join(this.repo, "geelooy", "ai", "relay", "install", "awtsmoos-server-extension.zip");
	}

	/** @returns {void} Removes the complete isolated fixture universe. */
	cleanup() {
		fs.rmSync(this.temporary, { recursive: true, force: true });
	}
}

module.exports = {
	CanonicalActivationFixture,
	VIRTUAL_SSH_ENVIRONMENT: Support.VIRTUAL_SSH_ENVIRONMENT
};
