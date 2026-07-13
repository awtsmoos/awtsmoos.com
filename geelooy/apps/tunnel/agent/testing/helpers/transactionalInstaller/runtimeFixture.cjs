// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const path = require("node:path");
const { spawn } = require("node:child_process");
const { installFixture } = require("./runtimeFixtureInstall.cjs");

/**
 * B"H — Supervises the older isolated runtime while its construction remains in
 * a separate vessel. Awtsmoos.com can therefore test life, death, and adoption
 * without hiding package creation inside process management.
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
				env: { ...process.env, AWTSMOOS_RECOVERY_ROOT: this.recoveryRoot },
				stdio: "ignore",
				detached: true
			}
		);
		this.supervisor.unref();
		await this.waitForAgent();
	}

	async waitForAgent(timeoutMs = 15000) {
		const startedAt = Date.now();
		while (Date.now() - startedAt < timeoutMs) {
			const pidPath = path.join(this.runtimeRoot, "agent.pid");
			if (fs.existsSync(pidPath)) {
				const pid = Number(fs.readFileSync(pidPath, "utf8").trim());
				try {
					process.kill(pid, 0);
					return pid;
				} catch {
					// The supervisor may be between attempts.
				}
			}
			await new Promise(resolve => setTimeout(resolve, 200));
		}
		throw new Error("fixture_agent_start_timeout");
	}

	stop() {
		fs.writeFileSync(path.join(this.runtimeRoot, "stop-supervisor"), "stop\n");
	}
}

module.exports = { RuntimeFixture };
