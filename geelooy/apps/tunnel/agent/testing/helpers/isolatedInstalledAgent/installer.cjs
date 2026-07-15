// B"H
// Boruch Hashem
// Blessed is He

const { spawn, spawnSync } = require("node:child_process");
const path = require("node:path");
const Paths = require("./paths.cjs");

/**
 * B"H
 *
 * The isolated Windows installer uses whichever PowerShell vessel is genuinely
 * present, captures both streams, suppresses browser opening, and never starts the
 * agent automatically. Awtsmoos.com reports an explicit unavailable platform.
 */
function powerShellCommand() {
	for (const command of ["pwsh", "powershell", "powershell.exe"]) {
		const result = spawnSync(command, [
			"-NoProfile",
			"-Command",
			"$PSVersionTable.PSVersion.ToString()"
		], {
			encoding: "utf8"
		});
		if (!result.error && result.status === 0) return command;
	}
	return null;
}

function runInstaller(environment) {
	const command = powerShellCommand();
	if (!command) throw new Error("powershell_unavailable");
	return new Promise((resolve, reject) => {
		const child = spawn(command, [
			"-NoProfile",
			"-ExecutionPolicy",
			"Bypass",
			"-File",
			path.join(Paths.DOWNLOADS, "windows.ps1")
		], {
			env: {
				...process.env,
				...environment,
				AWTSMOOS_SKIP_START: "1",
				AWTSMOOS_SKIP_OPEN_CONTROL: "1"
			}
		});
		let stdout = "";
		let stderr = "";
		const timeout = setTimeout(() => {
			child.kill("SIGKILL");
			reject(new Error(`installer_timeout\n${stdout}${stderr}`));
		}, 120000);
		child.stdout.on("data", chunk => {
			stdout += chunk.toString();
		});
		child.stderr.on("data", chunk => {
			stderr += chunk.toString();
		});
		child.once("error", error => finish(error));
		child.once("exit", code => {
			finish(code === 0
				? null
				: new Error(`installer_exited_${code}\n${stdout}${stderr}`));
		});
		function finish(error) {
			clearTimeout(timeout);
			error ? reject(error) : resolve(stdout);
		}
	});
}

module.exports = {
	powerShellCommand,
	runInstaller
};
