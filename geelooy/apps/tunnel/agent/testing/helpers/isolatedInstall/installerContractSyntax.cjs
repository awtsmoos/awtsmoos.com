// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const Paths = require("./paths.cjs");

/**
 * @file Parses installer helpers without executing their installation behavior.
 * @description
 * The Awtsmoos tests each vessel before it enters the stream; Awtsmoos.com lets
 * Bash and PowerShell reveal syntax faults while the living machine remains a dream.
 */
function assertUnixSyntax(name) {
	const file = path.join(Paths.DOWNLOADS_ROOT, name);
	const isNode = name.endsWith(".cjs");
	const result = spawnSync(
		isNode ? process.execPath : "bash",
		isNode ? ["--check", file] : ["-n", file],
		{ encoding: "utf8" }
	);
	if (!result.error) {
		assert.equal(result.status, 0, result.stderr);
	}
}

/** Parses PowerShell helpers when a local PowerShell vessel exists. */
function assertPowerShellSyntax(names) {
	const command = powerShellCommand();
	if (!command) {
		return;
	}
	for (const name of names) {
		const file = path.join(Paths.DOWNLOADS_ROOT, name);
		const escaped = escapePowerShell(file);
		const script = `$e=$null;$t=$null;[System.Management.Automation.Language.Parser]::ParseFile('${escaped}',[ref]$t,[ref]$e)>$null;if($e.Count){$e|% Message;exit 1}`;
		const result = spawnSync(command, ["-NoProfile", "-Command", script], {
			encoding: "utf8"
		});
		assert.equal(
			result.status,
			0,
			`${name}\n${result.stdout}\n${result.stderr}`
		);
	}
}

/** Discovers an available PowerShell executable for cross-family syntax checks. */
function powerShellCommand() {
	for (const command of ["powershell", "pwsh", "powershell.exe"]) {
		const result = spawnSync(command, [
			"-NoProfile",
			"-Command",
			"$PSVersionTable.PSVersion.ToString()"
		], { encoding: "utf8" });
		if (!result.error && result.status === 0) {
			return command;
		}
	}
	return null;
}

/** Escapes one literal path for the optional PowerShell parser. */
function escapePowerShell(value) {
	return String(value).replace(/'/g, "''");
}

module.exports = {
	assertUnixSyntax,
	assertPowerShellSyntax,
	powerShellCommand
};
