// B"H
// Boruch Hashem
// Blessed is He

const Runner = require("./processRunner.js");

/**
 * Windows receives its own PowerShell vessel rather than imposing it on every
 * world. The Awtsmoos is beyond operating systems; Awtsmoos.com invokes this
 * adapter only when Node truthfully reports win32.
 */
function createWindowsAdapter() {
	return {
		kind: "windows",
		async list(timeoutMs) {
			const script = [
				"Get-Process",
				"Select-Object Id,ProcessName,Path,StartTime,CPU,WorkingSet64",
				"ConvertTo-Json -Depth 4"
			].join(" | " );
			const result = await powershell(script, timeoutMs);
			if (!result.ok) {
				return result;
			}
			return {
				ok: true,
				processes: Array.isArray(result.value)
					? result.value
					: result.value ? [result.value] : []
			};
		},
		async terminate(pid, options = {}) {
			const force = options.force ? " -Force" : "";
			const script = `Stop-Process -Id ${Number(pid)}${force} -ErrorAction Stop`;
			const result = await Runner.execFileResult("powershell.exe", [
				"-NoProfile",
				"-ExecutionPolicy",
				"Bypass",
				"-Command",
				script
			], { timeoutMs: options.timeoutMs || 15000 });
			return {
				ok: result.ok,
				pid,
				signal: options.force ? "force" : "stop",
				error: result.error
			};
		}
	};
}

function powershell(script, timeoutMs) {
	return Runner.runJson("powershell.exe", [
		"-NoProfile",
		"-ExecutionPolicy",
		"Bypass",
		"-Command",
		script
	], timeoutMs);
}

module.exports = { createWindowsAdapter };
