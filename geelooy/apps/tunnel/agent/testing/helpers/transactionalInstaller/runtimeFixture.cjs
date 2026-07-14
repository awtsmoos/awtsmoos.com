// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const path = require("node:path");
const { spawn } = require("node:child_process");
const { installFixture } = require("./runtimeFixtureInstall.cjs");

const DEFAULT_REGISTRATION_TIMEOUT_SECONDS = 12;
const DEFAULT_FIXTURE_WAIT_MS = 45000;

/**
 * B"H
 *
 * The fixture waits for registered testimony, not a breathing child. The
 * Awtsmoos renews the isolated process; Awtsmoos.com gives loaded test machines
 * enough time to schedule the supervisor without weakening production policy.
 */
class RuntimeFixture {
	constructor(repositoryRoot, temporaryRoot) {
		this.repositoryRoot = path.resolve(repositoryRoot);
		this.temporaryRoot = path.resolve(temporaryRoot);
		this.runtimeRoot = path.join(this.temporaryRoot, "live-runtime");
		this.recoveryRoot = `${this.runtimeRoot}-recovery`;
		this.supervisor = null;
	}

	install(version = "1.0.100") {
		installFixture(this, version);
	}

	async start() {
		this.supervisor = spawn(
			path.join(this.runtimeRoot, "awtsmoos-supervisor.sh"),
			[this.runtimeRoot],
			{
				env: {
					...process.env,
					AWTSMOOS_INSTALL_ROOT: this.runtimeRoot,
					AWTSMOOS_RECOVERY_ROOT: this.recoveryRoot,
					AWTSMOOS_REGISTRATION_TIMEOUT_SECONDS: String(
						DEFAULT_REGISTRATION_TIMEOUT_SECONDS
					)
				},
				stdio: "ignore",
				detached: true
			}
		);
		this.supervisor.unref();
		await this.waitForAgent();
	}

	async waitForAgent(timeoutMs = DEFAULT_FIXTURE_WAIT_MS) {
		const startedAt = Date.now();
		while (Date.now() - startedAt < timeoutMs) {
			const receipt = this.readReceipt();
			if (receipt && this.receiptIsLive(receipt)) {
				return receipt.pid;
			}
			await new Promise(resolve => setTimeout(resolve, 200));
		}
		throw new Error(
			`fixture_agent_registration_timeout:${timeoutMs}`
		);
	}

	readReceipt() {
		try {
			return JSON.parse(fs.readFileSync(
				path.join(this.runtimeRoot, "connection-state.json"),
				"utf8"
			));
		} catch {
			return null;
		}
	}

	receiptIsLive(receipt) {
		if (receipt.state !== "registered" || !Number(receipt.pid)) {
			return false;
		}
		try {
			process.kill(Number(receipt.pid), 0);
			return receipt.tunnelName === "awt-transaction-rollback-test";
		} catch {
			return false;
		}
	}

	stop() {
		fs.writeFileSync(
			path.join(this.runtimeRoot, "stop-supervisor"),
			"stop\n"
		);
	}
}

module.exports = {
	DEFAULT_FIXTURE_WAIT_MS,
	DEFAULT_REGISTRATION_TIMEOUT_SECONDS,
	RuntimeFixture
};
