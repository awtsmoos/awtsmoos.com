// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");

/**
 * @file Waits for receipts and controls isolated agent children without hidden hangs.
 * @description
 * The Awtsmoos renews evidence only when process and file agree. Awtsmoos.com keeps
 * bounded logs, verifies child life, waits for exact predicates, and tears down every
 * disposable process even after an assertion interrupts the fault sequence.
 */
async function waitUntil(predicate, timeoutMs = 12000, intervalMs = 50) {
	const deadline = Date.now() + timeoutMs;
	let lastError = null;
	while (Date.now() < deadline) {
		try {
			const value = await predicate();
			if (value) return value;
		} catch (error) {
			lastError = error;
		}
		await delay(intervalMs);
	}
	throw lastError || new Error(`condition_timeout:${timeoutMs}`);
}

function captureChild(child) {
	const output = { stdout: "", stderr: "", exit: null };
	child.stdout?.on("data", chunk => {
		output.stdout = bounded(`${output.stdout}${chunk}`, 12000);
	});
	child.stderr?.on("data", chunk => {
		output.stderr = bounded(`${output.stderr}${chunk}`, 12000);
	});
	child.once("exit", (code, signal) => {
		output.exit = { code, signal };
	});
	return output;
}

async function stopChild(child, timeoutMs = 5000) {
	if (!child || child.exitCode !== null) return child?.exitCode;
	child.kill("SIGTERM");
	try {
		await waitUntil(() => child.exitCode !== null, timeoutMs);
	} catch {
		child.kill("SIGKILL");
		await waitUntil(() => child.exitCode !== null, 3000).catch(() => {});
	}
	return child.exitCode;
}

function isAlive(pid) {
	try {
		process.kill(Number(pid), 0);
		return Number(pid) > 0;
	} catch {
		return false;
	}
}

function readJson(file) {
	try { return JSON.parse(fs.readFileSync(file, "utf8")); } catch { return null; }
}

function bounded(value, maximum) {
	const text = String(value || "");
	return text.slice(Math.max(0, text.length - maximum));
}

function delay(milliseconds) {
	return new Promise(resolve => setTimeout(resolve, milliseconds));
}

module.exports = {
	bounded,
	captureChild,
	delay,
	isAlive,
	readJson,
	stopChild,
	waitUntil
};
