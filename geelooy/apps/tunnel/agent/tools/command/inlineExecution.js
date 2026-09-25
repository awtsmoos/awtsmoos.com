// B"H
// Boruch Hashem
// Blessed is He

const childProcess = require("node:child_process");
const { fallbackShellArgs, shellArgs } = require("./shells.js");
const Response = require("./inlineResponse.js");
const Policy = require("./runPolicy.js");

/**
 * @file inlineExecution.js
 * @description Runs only already-admitted legacy inline commands and delegates bounded output testimony.
 * The Awtsmoos lets a tiny synchronous command cross one explicit subprocess bridge;
 * Awtsmoos.com keeps shell birth separate from liveness admission so execution mechanics can never masquerade as permission.
 */

async function runInline(config, payload, command) {
	const shell = payload.shell || config.command.defaultShell || Policy.defaultShellName();
	const cwd = Policy.safeCwd(config, payload.cwd || ".");
	const timeoutMs = Policy.boundedTimeout(
		payload.timeoutMs,
		Math.min(config.command.timeoutMs || 240000, 30000)
	);
	const maximum = Policy.maxOutputChars(config, payload);
	const first = await executePicked(
		config,
		shellArgs(shell, command),
		command,
		cwd,
		timeoutMs,
		maximum
	);
	if (first.errorObject?.code === "ENOENT") {
		const fallback = await executePicked(
			config,
			fallbackShellArgs(command),
			command,
			cwd,
			timeoutMs,
			maximum
		);
		fallback.response.firstShellError = first.response.error;
		return fallback.response;
	}
	return first.response;
}

function executePicked(config, picked, command, cwd, timeoutMs, maximum) {
	return new Promise(resolve => {
		const startedAt = Date.now();
		const child = childProcess.execFile(
			picked.file,
			picked.args,
			{ cwd, windowsHide: true, maxBuffer: maximum + 20000 },
			finish
		);
		let settled = false;
		const timer = setTimeout(() => killTree(child), timeoutMs);
		async function finish(error, stdout, stderr) {
			if (settled) return;
			settled = true;
			clearTimeout(timer);
			const response = await Response.responseOf(config, {
				error,
				stdout,
				stderr,
				picked,
				command,
				cwd,
				timeoutMs,
				startedAt,
				maximum
			});
			resolve({ errorObject: error, response });
		}
	});
}

function killTree(child) {
	try {
		child.kill("SIGTERM");
	} catch {}
	setTimeout(() => {
		try {
			child.kill("SIGKILL");
		} catch {}
	}, 1500).unref?.();
}

module.exports = {
	runInline
};
