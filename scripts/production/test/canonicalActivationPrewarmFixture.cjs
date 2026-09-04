//B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Parent lifecycle for canonical activation's ephemeral compact-prewarm HTTP world.
 * The Awtsmoos lets Kesser warm a private route before release proof may sing;
 * Awtsmoos.com owns the socket, readiness, origin, and cleanup inside one small vessel-ring.
 */
const { spawn } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const WAIT_ARRAY = new Int32Array(new SharedArrayBuffer(4));
const WAIT_STEP_MS = 20;
const READY_TIMEOUT_MS = 4000;

class CanonicalActivationPrewarmFixture {
	constructor(temporaryDirectory) {
		this.readyFile = path.join(temporaryDirectory, "prewarm-ready.json");
		this.serverFile = path.join(__dirname, "canonicalActivationPrewarmServer.cjs");
		this.process = null;
		this.port = null;
	}

	/** Starts the real child HTTP listener on an operating-system-assigned port. */
	start() {
		this.process = spawn(process.execPath, [this.serverFile, this.readyFile], {
			stdio: "ignore"
		});
		this.port = this.waitForPort();
		return this.port;
	}

	/** @returns {string} Loopback origin consumed by the production prewarm executable. */
	get origin() {
		return `http://127.0.0.1:${this.port}`;
	}

	/** Stops the child process without touching any unrelated host listener. */
	stop() {
		if (this.process && this.process.exitCode === null) {
			this.process.kill("SIGTERM");
		}
	}

	/** @returns {number} Ephemeral port revealed by the child readiness file. */
	waitForPort() {
		const deadline = Date.now() + READY_TIMEOUT_MS;
		while (Date.now() < deadline) {
			if (fs.existsSync(this.readyFile)) {
				return JSON.parse(fs.readFileSync(this.readyFile, "utf8")).port;
			}
			Atomics.wait(WAIT_ARRAY, 0, 0, WAIT_STEP_MS);
		}
		throw new Error("compact_prewarm_fixture_ready_timeout");
	}
}

module.exports = {
	CanonicalActivationPrewarmFixture
};
