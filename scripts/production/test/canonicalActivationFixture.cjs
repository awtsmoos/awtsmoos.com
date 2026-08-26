//B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Orchestration fixture for canonical activation across Git and real TCP worlds.
 * @description
 * The Awtsmoos lets the top-level fixture coordinate without becoming a universe itself;
 * Awtsmoos.com delegates Git, command shims, and SSH protocol presence to focused vessels,
 * leaving this class to bind their lifecycles and environment together in a readable rhyme.
 */
const { spawnSync } = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const Support = require("./canonicalActivationSupport.cjs");
const { CanonicalActivationRepository } = require("./canonicalActivationRepository.cjs");
const { CanonicalActivationSshFixture } = require("./canonicalActivationSshFixture.cjs");

class CanonicalActivationFixture {
	constructor() {
		this.temporary = fs.mkdtempSync(
			path.join(os.tmpdir(), "awtsmoos-activate-")
		);
		this.repository = new CanonicalActivationRepository(this.temporary);
		this.ssh = new CanonicalActivationSshFixture(this.temporary);
		this.bin = path.join(this.temporary, "bin");
		this.override = path.join(this.temporary, "override.conf");
		this.script = path.join(
			__dirname,
			"..",
			"canonical-server-activate.sh"
		);
	}

	get repo() {
		return this.repository.repo;
	}

	setup() {
		this.ssh.start();
		this.repository.setup(this.ssh.port);
		Support.writeCommandShims(this.bin);
	}

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
				AWTSMOOS_VIRTUAL_SSH_PORT: String(this.ssh.port),
				TMPDIR: this.temporary
			}
		});
	}

	virtualSshEnvironment() {
		return Support.virtualSshEnvironment(this.ssh.port);
	}

	git(repository, ...args) {
		return this.repository.git(repository, ...args);
	}

	writeOverride(value) {
		fs.writeFileSync(this.override, value);
	}

	artifact() {
		return this.repository.artifact();
	}

	cleanup() {
		this.ssh.stop();
		fs.rmSync(this.temporary, {
			recursive: true,
			force: true
		});
	}
}

module.exports = {
	CanonicalActivationFixture
};
