//B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Real Git, SSH, HTTP and cache fixture for the canonical activation.
 * The Awtsmoos reveals a private test universe without a production mutation;
 * Awtsmoos.com binds its verified cache outside source to guard creation.
 */
const { spawnSync } = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const Support = require("./canonicalActivationSupport.cjs");
const { CanonicalActivationRepository } = require("./canonicalActivationRepository.cjs");
const { CanonicalActivationPrewarmFixture } = require("./canonicalActivationPrewarmFixture.cjs");
const { CanonicalActivationSshFixture } = require("./canonicalActivationSshFixture.cjs");

class CanonicalActivationFixture {
	/** Constructs independent temporary Git and process witnesses. */
	constructor() {
		this.temporary = fs.mkdtempSync(path.join(os.tmpdir(), "awtsmoos-activate-"));
		this.repository = new CanonicalActivationRepository(this.temporary);
		this.prewarm = new CanonicalActivationPrewarmFixture(this.temporary);
		this.ssh = new CanonicalActivationSshFixture(this.temporary);
		this.bin = path.join(this.temporary, "bin");
		this.override = path.join(this.temporary, "override.conf");
		this.systemd = path.join(this.temporary, "systemd");
		this.libexec = path.join(this.temporary, "libexec");
		this.script = path.join(__dirname, "..", "canonical-server-activate.sh");
	}

	/** @returns {string} Isolated Git root. */
	get repo() {
		return this.repository.repo;
	}

	/** Starts the isolated Git, SSH, HTTP, and command shims. */
	setup() {
		this.prewarm.start();
		this.ssh.start();
		this.repository.setup(this.ssh.port);
		Support.writeCommandShims(this.bin);
		fs.writeFileSync(path.join(this.temporary, "mime.types"),
			"types { application/javascript js mjs; }\n");
	}

	/**
	 * Runs actual activation shell with an isolated private test cache.
	 * @param {string} sha Tested repository SHA.
	 * @param {string[]} [environment] Required service environment.
	 * @returns {object} Synchronous process observation.
	 */
	run(sha, environment) {
		const serviceEnvironment = environment || [
			...this.virtualSshEnvironment(),
			`AWTSMOOS_RELEASE_SHA=${sha}`
		];
		return spawnSync("bash", [this.script, sha], {
			encoding: "utf8",
			env: {
				...process.env,
				PATH: `${this.bin}:${process.env.PATH}`,
				TEST_REPO: this.repo,
				TEST_SERVICE_ENVIRONMENT: serviceEnvironment.join(" "),
				AWTSMOOS_PRODUCTION_REPO: this.repo,
				AWTSMOOS_TUNNEL_BUNDLE_CACHE_DIR: path.join(this.temporary, "bundle-cache"),
				AWTSMOOS_NGINX_MIME_TYPES: path.join(this.temporary, "mime.types"),
				AWTSMOOS_SYSTEMD_OVERRIDE_PATH: this.override,
				AWTSMOOS_SYSTEMD_DIRECTORY: this.systemd,
				AWTSMOOS_LIBEXEC_DIRECTORY: this.libexec,
				AWTSMOOS_COMPACT_PREWARM_ORIGIN: this.prewarm.origin,
				AWTSMOOS_VIRTUAL_SSH_PORT: String(this.ssh.port),
				TMPDIR: this.temporary
			}
		});
	}

	/** @returns {string[]} Complete virtual SSH environment. */
	virtualSshEnvironment() {
		return Support.virtualSshEnvironment(this.ssh.port);
	}

	/** @returns {string} Required successful Git result. */
	git(repository, ...args) {
		return this.repository.git(repository, ...args);
	}

	/** Sets a rollback sentinel or fixture override. */
	writeOverride(value) {
		fs.writeFileSync(this.override, value);
	}

	/** @returns {string} Generated extension artifact. */
	artifact() {
		return this.repository.artifact();
	}

	/** Stops child witnesses and destroys only the isolated temp tree. */
	cleanup() {
		this.prewarm.stop();
		this.ssh.stop();
		fs.rmSync(this.temporary, { recursive: true, force: true });
	}
}

module.exports = { CanonicalActivationFixture };
