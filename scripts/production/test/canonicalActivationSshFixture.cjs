//B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Parent-side lifecycle for the real TCP SSH-banner activation fixture.
 * @description
 * The Awtsmoos lets one child socket keep breathing while the parent runs synchronous
 * release scripts; Awtsmoos.com discovers its ephemeral port through a readiness file
 * and changes only the banner garment between proofs, so network reality may rhyme.
 */
const { spawn } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const WAIT_ARRAY = new Int32Array(new SharedArrayBuffer(4));
const WAIT_STEP_MS = 20;
const READY_TIMEOUT_MS = 4000;

class CanonicalActivationSshFixture {
	constructor(temporaryDirectory) {
		this.readyFile = path.join(temporaryDirectory, "ssh-ready.json");
		this.bannerFile = path.join(temporaryDirectory, "ssh-banner.txt");
		this.serverFile = path.join(__dirname, "virtualSshFixtureServer.cjs");
		this.process = null;
		this.port = null;
	}

	/** Starts the real child listener on an operating-system-assigned port. */
	start() {
		this.setBanner("SSH-2.0-Awtsmoos-Activation-Test");
		this.process = spawn(process.execPath, [
			this.serverFile,
			"0",
			this.readyFile,
			this.bannerFile
		], { stdio: "ignore" });
		this.port = this.waitForPort();
		return this.port;
	}

	/** @param {string} banner Protocol line emitted on future connections. */
	setBanner(banner) {
		fs.writeFileSync(this.bannerFile, `${banner}\n`);
	}

	/** Stops the child process without touching any host listener. */
	stop() {
		if (this.process && this.process.exitCode === null) {
			this.process.kill("SIGTERM");
		}
	}

	waitForPort() {
		const deadline = Date.now() + READY_TIMEOUT_MS;
		while (Date.now() < deadline) {
			if (fs.existsSync(this.readyFile)) {
				return JSON.parse(fs.readFileSync(this.readyFile, "utf8")).port;
			}
			Atomics.wait(WAIT_ARRAY, 0, 0, WAIT_STEP_MS);
		}
		throw new Error("virtual_ssh_fixture_ready_timeout");
	}
}

module.exports = {
	CanonicalActivationSshFixture
};
