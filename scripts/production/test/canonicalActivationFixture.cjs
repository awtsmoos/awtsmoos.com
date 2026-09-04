//B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Orchestration fixture for canonical activation across Git, TCP, and HTTP worlds.
 * @description
 * The Awtsmoos lets the top-level fixture coordinate without becoming a universe itself;
 * Awtsmoos.com delegates Git, command shims, SSH, prewarm HTTP, and watchdog installation
 * into temporary vessels, leaving this class to bind their lifecycles in readable rhyme.
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
	/** Creates isolated repository, TCP, HTTP, command-shim, and override vessels. */
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

	/** @returns {string} Temporary canonical repository root. */
	get repo() {
		return this.repository.repo;
	}

	/** Starts the real TCP/HTTP witnesses, repository universe, and command shims. */
	setup() {
		this.prewarm.start();
		this.ssh.start();
		this.repository.setup(this.ssh.port);
		Support.writeCommandShims(this.bin);
	}

	/**
	 * Runs canonical activation against ephemeral SSH and compact-prewarm protocol fixtures.
	 * @param {string} sha Expected canonical commit SHA.
	 * @param {string[]} [environment] Simulated systemd service environment.
	 * @returns {object} Synchronous child-process result.
	 */
	run(sha, environment = this.virtualSshEnvironment()) {
		return spawnSync("bash", [this.script, sha], {
			encoding: "utf8",
			env: {
				...process.env,
				PATH: `${this.bin}:${process.env.PATH}`,
				TEST_REPO: this.repo,
				TEST_SERVICE_ENVIRONMENT: environment.join(" "),
				AWTSMOOS_PRODUCTION_REPO: this.repo,
				AWTSMOOS_SYSTEMD_OVERRIDE_PATH: this.override,
				AWTSMOOS_SYSTEMD_DIRECTORY: this.systemd,
				AWTSMOOS_LIBEXEC_DIRECTORY: this.libexec,
				AWTSMOOS_COMPACT_PREWARM_ORIGIN: this.prewarm.origin,
				AWTSMOOS_VIRTUAL_SSH_PORT: String(this.ssh.port),
				TMPDIR: this.temporary
			}
		});
	}

	/** @returns {string[]} Complete virtual-SSH environment for the ephemeral port. */
	virtualSshEnvironment() {
		return Support.virtualSshEnvironment(this.ssh.port);
	}

	/** @returns {string} Trimmed stdout from one required-success Git invocation. */
	git(repository, ...args) {
		return this.repository.git(repository, ...args);
	}

	/** @param {string} value Override sentinel or fixture content. */
	writeOverride(value) {
		fs.writeFileSync(this.override, value);
	}

	/** @returns {string} Generated extension artifact path. */
	artifact() {
		return this.repository.artifact();
	}

	/** Stops child witnesses and removes the complete temporary fixture universe. */
	cleanup() {
		this.prewarm.stop();
		this.ssh.stop();
		fs.rmSync(this.temporary, { recursive: true, force: true });
	}
}

module.exports = { CanonicalActivationFixture };
