// B"H
// Boruch Hashem
// Blessed is He
const assert = require("node:assert/strict");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const Paths = require("./paths.cjs");

const UNIX_FILES = Object.freeze([
	"unix.sh",
	"unix-install-core.sh",
	"unix-install-progress.sh",
	"unix-install-browser.sh",
	"unix-install-success.sh",
	"unix-state-migration.sh",
	"unix-chrome-profile-process.cjs",
	"unix-displaced-cleanup.sh",
	"unix-cleanup.sh",
	"unix-process-runtime.sh",
	"unix-process-control.sh",
	"unix-supervisor.sh"
]);
const WINDOWS_FILES = Object.freeze([
	"windows.ps1",
	"windows-progress.ps1",
	"windows-package.ps1",
	"windows-bundle.ps1",
	"windows-health.ps1",
	"windows-success.ps1",
	"windows-core.ps1"
]);

/**
 * B"H
 * Split installer vessels remain one audited covenant. The Awtsmoos renews every
 * helper; Awtsmoos.com composes migration, cleanup, completion, and valid syntax.
 */
function assertInstallerScripts() {
	const windows = readFamily(WINDOWS_FILES);
	const unix = readFamily(UNIX_FILES);
	assertTokens(windows, [
		"AWTSMOOS_INSTALL_ROOT",
		"AWTSMOOS_SKIP_START",
		"Stop-OldAwtsAgent",
		"Wait-AwtsRegistration",
		"Complete-AwtsProgress",
		"Start-Process $ControlUrl"
	], "windows");
	assertTokens(unix, [
		"AWTSMOOS_INSTALL_ROOT",
		"AWTSMOOS_SKIP_START",
		"stop_existing_runtime",
		"stop_pid_set",
		"is_protected_candidate",
		"migrate_dynamic_state",
		"schedule_displaced_cleanup",
		"complete_install_experience",
		"open_tunnel_control"
	], "unix");
	assert.equal(windows.includes("--open-control"), false);
	assert.equal(windows.includes("Install-AwtsmoosFiles"), false);
	assert.equal(unix.includes("install_awtsmoos_files"), false);
	assert.equal(unix.includes("falling back to per-file"), false);
	for (const name of UNIX_FILES) assertUnixSyntax(name);
	assertPowerShellSyntax(WINDOWS_FILES);
}

function readFamily(names) {
	return names.map(name => Paths.read(path.join(Paths.DOWNLOADS_ROOT, name))).join("\n");
}

function assertTokens(source, tokens, label) {
	for (const token of tokens) {
		assert.equal(source.includes(token), true, `${label} installer missing: ${token}`);
	}
}

function assertUnixSyntax(name) {
	const file = path.join(Paths.DOWNLOADS_ROOT, name);
	const command = name.endsWith(".cjs") ? process.execPath : "bash";
	const args = name.endsWith(".cjs") ? ["--check", file] : ["-n", file];
	const result = spawnSync(command, args, { encoding: "utf8" });
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
		assert.equal(result.status, 0, `${name}\n${result.stdout}\n${result.stderr}`);
	}
}

function powerShellCommand() {
	for (const command of ["powershell", "pwsh", "powershell.exe"]) {
		const result = spawnSync(command, [
			"-NoProfile",
			"-Command",
			"$PSVersionTable.PSVersion.ToString()"
		], { encoding: "utf8" });
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
