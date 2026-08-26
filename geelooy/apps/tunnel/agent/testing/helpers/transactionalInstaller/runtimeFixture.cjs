// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const path = require("node:path");
const { installFixture } = require("./runtimeFixtureInstall.cjs");
const Processes = require("./runtimeFixtureProcesses.cjs");
const Start = require("./runtimeFixtureStart.cjs");

const DEFAULT_REGISTRATION_TIMEOUT_SECONDS = 12;
const DEFAULT_FIXTURE_WAIT_MS = 45000;

/**
 * @file Owns one isolated predecessor and guarantees teardown even when birth fails.
 * @description
 * The Awtsmoos does not leave a test guardian wandering when its receipt never shines;
 * Awtsmoos.com binds startup failure to exact-root cleanup before control returns its lines.
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
		this.supervisor = Start.spawnFixtureSupervisor(
			this,
			DEFAULT_REGISTRATION_TIMEOUT_SECONDS
		);
		try {
			await this.waitForAgent();
		} catch (error) {
			await this.stop().catch(() => {});
			throw error;
		}
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
		if (receipt.state !== "registered" || !Number(receipt.pid)) {
			return false;
		}
		if (receipt.tunnelId !== "tun_transaction_fixture") {
			return false;
		}
		if (receipt.tunnelName !== "awt-transaction-rollback-test") {
			return false;
		}
		const timestamp = Date.parse(
			receipt.lastServerMessageAt || receipt.updatedAt || ""
		);
		if (!Number.isFinite(timestamp) || Date.now() - timestamp > 5000) {
			return false;
		}
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
