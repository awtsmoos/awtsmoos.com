// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const Script = require("./installerExperienceScript.cjs");

/**
 * @file Builds disposable installer worlds without inheriting live-agent policy.
 * @description
 * The Awtsmoos renews registration, root readiness, guardian ownership, and browser
 * testimony separately. Awtsmoos.com explicitly resets every installer-facing option
 * that a foreground rescue agent may export, so isolated proof cannot be skipped by
 * the machine environment it is meant to test.
 */
function createHarness(repositoryRoot, sandbox) {
	const downloads = path.join(repositoryRoot, "geelooy/apps/tunnel/downloads");
	let invocation = 0;

	function run(mode, environment = {}) {
		invocation += 1;
		prepareFixture();
		prepareRecentControl(environment);
		const progressFile = path.join(sandbox, `${mode}-${invocation}.progress`);
		return spawnSync("bash", ["-c", Script.buildScript(downloads, sandbox, mode)], {
			encoding: "utf8",
			env: isolatedEnvironment(environment, progressFile)
		});
	}

	function isolatedEnvironment(environment, progressFile) {
		return {
			...process.env,
			...environment,
			ROOT: path.join(sandbox, "root"),
			RECOVERY_ROOT: path.join(sandbox, "recovery"),
			AWTSMOOS_INSTALL_RUNTIME: downloads,
			AWTSMOOS_INSTALL_PROGRESS_FILE: progressFile,
			AWTSMOOS_PROGRESS_MODE: "plain",
			AWTSMOOS_BROWSER_OPENER: path.join(sandbox, "opener"),
			AWTSMOOS_SKIP_OPEN_CONTROL:
				environment.AWTSMOOS_SKIP_OPEN_CONTROL ?? "0",
			AWTSMOOS_CONTROL_URL: environment.AWTSMOOS_CONTROL_URL ?? ""
		};
	}

	function prepareFixture() {
		const root = path.join(sandbox, "root");
		fs.mkdirSync(root, { recursive: true });
		fs.rmSync(path.join(root, "device-binding.json"), { force: true });
		fs.writeFileSync(path.join(root, "config.json"), JSON.stringify({
			tunnelName: "awt-experience-test",
			root: "/tmp/awts-project",
			allowWrite: true
		}));
		fs.writeFileSync(path.join(root, "install-state.txt"), "9.9.9\n");
		fs.writeFileSync(path.join(root, "agent.pid"), "4242\n");
		fs.writeFileSync(path.join(root, "supervisor.pid"), "4343\n");
		fs.writeFileSync(path.join(root, "connection-state.json"), JSON.stringify({
			state: "registered",
			pid: 4242,
			tunnelId: "tun_experience_test",
			tunnelName: "awt-experience-test"
		}));
		fs.writeFileSync(path.join(sandbox, "opener"), openerScript());
		fs.chmodSync(path.join(sandbox, "opener"), 0o755);
	}

	function prepareRecentControl(environment) {
		if (environment.AWTS_TEST_RECENT_CONTROL !== "1") return;
		fs.writeFileSync(
			path.join(sandbox, "root", "device-binding.json"),
			JSON.stringify({ lastControlOpenedAt: new Date().toISOString() })
		);
	}

	function openerScript() {
		const openedPath = JSON.stringify(path.join(sandbox, "opened.txt"));
		return `#!${process.execPath}\nrequire("node:fs").writeFileSync(${openedPath}, String(process.argv[2] || "") + "\\n");\n`;
	}

	function windowsSources() {
		return [
			"windows.ps1",
			"windows-core.ps1",
			"windows-health.ps1",
			"windows-success.ps1"
		].map(name => fs.readFileSync(path.join(downloads, name), "utf8")).join("\n");
	}

	function waitForOpened(timeoutMs = 2000) {
		const openedPath = path.join(sandbox, "opened.txt");
		const deadline = Date.now() + timeoutMs;
		const sleeper = new Int32Array(new SharedArrayBuffer(4));
		while (Date.now() < deadline && !fs.existsSync(openedPath)) {
			Atomics.wait(sleeper, 0, 0, 25);
		}
		return openedPath;
	}

	return {
		openedPath: path.join(sandbox, "opened.txt"),
		percentages,
		run,
		waitForOpened,
		windowsSources
	};
}

function percentages(text) {
	return [...text.matchAll(/\[\s*(\d+)%\]/g)].map(match => Number(match[1]));
}

module.exports = { createHarness };
