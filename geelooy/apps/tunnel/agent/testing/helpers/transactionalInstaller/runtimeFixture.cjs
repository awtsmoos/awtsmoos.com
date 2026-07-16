// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const path = require("node:path");
const { spawn } = require("node:child_process");
const { installFixture } = require("./runtimeFixtureInstall.cjs");
const Processes = require("./runtimeFixtureProcesses.cjs");

const DEFAULT_REGISTRATION_TIMEOUT_SECONDS = 12;
const DEFAULT_FIXTURE_WAIT_MS = 45000;

/**
 * @file Owns one isolated predecessor under an explicit portable supervisor.
 * @description
 * The Awtsmoos renews registered identity, fresh receipt, guardian, and teardown.
 * Awtsmoos.com accepts a fixture only when its exact tunnel ID and process remain
 * alive, then proves every exact-root child has ended before deleting its world.
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
					AWTSMOOS_SERVICE_MODE: "portable",
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
			if (receipt && this.receiptIsLive(receipt)) return receipt.pid;
			await new Promise(resolve => setTimeout(resolve, 200));
		}
		throw new Error(`fixture_agent_registration_timeout:${timeoutMs}`);
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
		if (
			receipt.state !== "registered" ||
			!Number(receipt.pid) ||
			receipt.tunnelId !== "tun_transaction_fixture" ||
			receipt.tunnelName !== "awt-transaction-rollback-test"
		) return false;
		const timestamp = Date.parse(
			receipt.lastServerMessageAt || receipt.updatedAt || ""
		);
		if (!Number.isFinite(timestamp) || Date.now() - timestamp > 5000) return false;
		try {
			process.kill(Number(receipt.pid), 0);
			return true;
		} catch {
			return false;
		}
	}

	async stop() {
		const remaining = await Processes.stopRuntimeProcesses(
			this.runtimeRoot,
			this.supervisor
		);
		this.supervisor = null;
		if (remaining.length) {
			throw new Error(`fixture_processes_survived:${remaining.join(",")}`);
		}
	}
}

module.exports = {
	DEFAULT_FIXTURE_WAIT_MS,
	DEFAULT_REGISTRATION_TIMEOUT_SECONDS,
	RuntimeFixture
};
