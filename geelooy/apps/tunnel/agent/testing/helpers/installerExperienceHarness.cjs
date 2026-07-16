// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

/**
 * B"H
 * The harness creates a disposable registered or unregistered installer world.
 * The Awtsmoos renews receipt and visible outcome; Awtsmoos.com tests experience
 * without stopping, replacing, or opening anything in the user's living runtime.
 */
function createHarness(repositoryRoot, sandbox) {
	const downloads = path.join(repositoryRoot, "geelooy/apps/tunnel/downloads");
	let invocation = 0;

	function run(mode, environment = {}) {
		invocation += 1;
		prepareFixture();
		if (environment.AWTS_TEST_RECENT_CONTROL === "1") {
			fs.writeFileSync(
				path.join(sandbox, "root", "device-binding.json"),
				JSON.stringify({ lastControlOpenedAt: new Date().toISOString() })
			);
		}
		const progressFile = path.join(sandbox, `${mode}-${invocation}.progress`);
		return spawnSync("bash", ["-c", script(mode)], {
			encoding: "utf8",
			env: {
				...process.env,
				...environment,
				ROOT: path.join(sandbox, "root"),
				RECOVERY_ROOT: path.join(sandbox, "recovery"),
				AWTSMOOS_INSTALL_RUNTIME: downloads,
				AWTSMOOS_INSTALL_PROGRESS_FILE: progressFile,
				AWTSMOOS_PROGRESS_MODE: "plain",
				AWTSMOOS_BROWSER_OPENER: path.join(sandbox, "opener")
			}
		});
	}

	function prepareFixture() {
		const root = path.join(sandbox, "root");
		fs.mkdirSync(root, { recursive: true });
		fs.writeFileSync(path.join(root, "config.json"), JSON.stringify({
			tunnelName: "awt-experience-test",
			root: "/tmp/awts-project"
		}));
		fs.writeFileSync(path.join(root, "install-state.txt"), "9.9.9\n");
		fs.writeFileSync(path.join(root, "agent.pid"), "4242\n");
		fs.writeFileSync(path.join(sandbox, "opener"), openerScript());
		fs.chmodSync(path.join(sandbox, "opener"), 0o755);
	}

	function openerScript() {
		return `#!${process.execPath}\nrequire("node:fs").writeFileSync(${JSON.stringify(path.join(sandbox, "opened.txt"))}, String(process.argv[2] || "") + "\\n");\n`;
	}

	function script(mode) {
		const action = mode === "monotonic"
			? "install_progress 30 A; install_progress 20 B; install_progress 50 C"
			: "complete_install_experience committed";
		return `set -Eeuo pipefail
origin=https://awtsmoos.com
source "$AWTSMOOS_INSTALL_RUNTIME/unix-install-progress.sh"
install_event(){ :; }
install_fail(){ echo "INSTALL_FAIL:$*"; exit 77; }
skip_start_requested(){ [ "\${AWTS_TEST_SKIP_START:-0}" = "1" ]; }
runtime_pid_matches(){ return 0; }
runtime_registered(){ [ "\${AWTS_TEST_REGISTERED:-0}" = "1" ]; }
is_alive(){ return 1; }
legacy_log_registered(){ return 1; }
connection_state_name(){ printf disconnected; }
source "$AWTSMOOS_INSTALL_RUNTIME/unix-install-browser.sh"
source "$AWTSMOOS_INSTALL_RUNTIME/unix-install-success.sh"
run_browser_opener(){ printf '%s\\n' "$1" > ${shellQuote(path.join(sandbox, "opened.txt"))}; }
${action}`;
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

function shellQuote(value) {
	return `'${String(value).replace(/'/g, `'"'"'`)}'`;
}

module.exports = { createHarness };
