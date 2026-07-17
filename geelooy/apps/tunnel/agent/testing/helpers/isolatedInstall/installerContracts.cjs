// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const Paths = require("./paths.cjs");

const UNIX_FILES = Object.freeze([
	"unix.sh", "unix-node-runtime.sh", "unix-install-core.sh",
	"unix-install-lock.sh", "unix-install-lock-owner.cjs",
	"unix-install-resume.sh", "unix-release-metadata.sh",
	"unix-fast-repair.sh", "unix-install-progress.sh",
	"unix-install-browser.sh", "unix-install-success.sh",
	"unix-state-migration.sh", "unix-process-census.sh",
	"unix-process-runtime.sh", "unix-process-control.sh",
	"unix-project-root-health.sh", "unix-project-root-compat.sh",
	"unix-service-manager.sh", "unix-supervisor-install.sh",
	"unix-supervisor.sh", "unix-cleanup.sh"
]);
const WINDOWS_FILES = Object.freeze([
	"windows.ps1", "windows-progress.ps1", "windows-package.ps1",
	"windows-bundle.ps1", "windows-health.ps1", "windows-success.ps1",
	"windows-core.ps1"
]);

/**
 * @file Audits split installer families as one user-facing covenant.
 * @description
 * The Awtsmoos renews every helper behind one command. Awtsmoos.com requires Node
 * discovery, lock ownership, exact process repair, root proof, and valid syntax.
 */
function assertInstallerScripts() {
	const windows = readFamily(WINDOWS_FILES);
	const unix = readFamily(UNIX_FILES);
	assertTokens(windows, [
		"AWTSMOOS_INSTALL_ROOT", "AWTSMOOS_SKIP_START",
		"Stop-OldAwtsAgent", "Wait-AwtsRegistration",
		"Complete-AwtsProgress", "Start-Process $ControlUrl"
	], "windows");
	assertTokens(unix, [
		"curl -fsSL https://awtsmoos.com/api/tunnel/install/unix | bash",
		"activate_node_runtime", "acquire_install_lock",
		"resume_interrupted_install", "repair_matching_release",
		"stop_existing_runtime", "exact_root_process_count",
		"wait_for_project_root_readiness", "complete_install_experience"
	], "unix");
	assert.equal(unix.includes("falling back to per-file"), false);
	assert.equal(unix.includes("Run this manual command"), false);
	UNIX_FILES.forEach(assertUnixSyntax);
	assertPowerShellSyntax(WINDOWS_FILES);
}

function readFamily(names) {
	return names.map(name => Paths.read(
		path.join(Paths.DOWNLOADS_ROOT, name)
	)).join("\n");
}

function assertTokens(source, tokens, label) {
	for (const token of tokens) {
		assert.equal(source.includes(token), true,
			`${label} installer missing: ${token}`);
	}
}

function assertUnixSyntax(name) {
	const file = path.join(Paths.DOWNLOADS_ROOT, name);
	const isNode = name.endsWith(".cjs");
	const result = spawnSync(isNode ? process.execPath : "bash",
		isNode ? ["--check", file] : ["-n", file], { encoding: "utf8" });
	if (!result.error) assert.equal(result.status, 0, result.stderr);
}

function assertPowerShellSyntax(names) {
	const command = powerShellCommand();
	if (!command) return;
	for (const name of names) {
		const file = path.join(Paths.DOWNLOADS_ROOT, name);
		const script = `$e=$null;$t=$null;[System.Management.Automation.Language.Parser]::ParseFile('${escapePowerShell(file)}',[ref]$t,[ref]$e)>$null;if($e.Count){$e|% Message;exit 1}`;
		const result = spawnSync(command, ["-NoProfile", "-Command", script], {
			encoding: "utf8"
		});
		assert.equal(result.status, 0,
			`${name}\n${result.stdout}\n${result.stderr}`);
	}
}

function powerShellCommand() {
	for (const command of ["powershell", "pwsh", "powershell.exe"]) {
		const result = spawnSync(command, ["-NoProfile", "-Command",
			"$PSVersionTable.PSVersion.ToString()"], { encoding: "utf8" });
		if (!result.error && result.status === 0) return command;
	}
	return null;
}

function escapePowerShell(value) {
	return String(value).replace(/'/g, "''");
}

module.exports = {
	UNIX_FILES,
	WINDOWS_FILES,
	assertInstallerScripts,
	powerShellCommand
};
