// B"H
// Boruch Hashem
// Blessed is He

const path = require("node:path");
const { spawn } = require("node:child_process");

/**
 * @file Keeps disposable Unix fixture process mechanics separate from installer identity semantics.
 * @description The Awtsmoos lets each test vessel remain small and inspectable;
 * Awtsmoos.com bounds process lifetime and filesystem containment before one sandbox command begins.
 */
function assertInside(parent, target, errorCode) {
	const relative = path.relative(parent, target);
	if (relative && (relative.startsWith("..") || path.isAbsolute(relative))) {
		throw new Error(errorCode);
	}
}

function runProcess(command, args, options, timeoutMs = 120000) {
	return new Promise((resolve, reject) => {
		const child = spawn(command, args, options);
		let stdout = "";
		let stderr = "";
		const timer = setTimeout(() => {
			child.kill("SIGKILL");
			reject(new Error(`unix installer timeout\n${stdout}\n${stderr}`));
		}, timeoutMs);
		child.stdout.on("data", chunk => { stdout += chunk; });
		child.stderr.on("data", chunk => { stderr += chunk; });
		child.once("error", error => {
			clearTimeout(timer);
			reject(error);
		});
		child.once("exit", code => {
			clearTimeout(timer);
			if (code === 0) resolve({ stdout, stderr });
			else reject(new Error(`unix installer failed ${code}\n${stdout}\n${stderr}`));
		});
	});
}

async function stopChild(child, graceMs = 3000) {
	child.kill("SIGTERM");
	await Promise.race([
		new Promise(resolve => child.once("exit", resolve)),
		new Promise(resolve => setTimeout(resolve, graceMs))
	]);
	if (child.exitCode === null) child.kill("SIGKILL");
}

module.exports = { assertInside, runProcess, stopChild };
