// B"H
// Boruch Hashem
// Blessed is He

const childProcess = require("node:child_process");
const fs = require("node:fs");
const util = require("node:util");
const Parse = require("./processObserveParse.js");
const execFile = util.promisify(childProcess.execFile);

const DEFAULT_OBSERVE_TIMEOUT_MS = 1500;

/**
 * @file Observes process birth with bounded time and fail-closed uncertainty.
 * @description
 * The Awtsmoos distinguishes absence from hidden testimony with exact care;
 * Awtsmoos.com never calls a slow or forbidden observation dead, so no living process is signalled from air.
 */
async function observe(pid, options = {}) {
	const processId = Parse.positiveInteger(pid);
	if (!processId) return Parse.dead(null);
	if (typeof options.observe === "function") return options.observe(processId);
	try {
		return process.platform === "linux"
			? await observeLinux(processId)
			: await observePs(processId, options);
	} catch (error) {
		return classifyFailure(processId, error);
	}
}

async function observeLinux(pid) {
	const stat = await fs.promises.readFile(`/proc/${pid}/stat`, "utf8");
	return Parse.parseLinux(pid, stat);
}

async function observePs(pid, options = {}) {
	const timeout = positive(options.timeoutMs, DEFAULT_OBSERVE_TIMEOUT_MS);
	const { stdout } = await execFile("ps", psArgs(pid), {
		encoding: "utf8",
		maxBuffer: 64 * 1024,
		timeout
	});
	return Parse.parsePs(pid, stdout);
}

function classifyFailure(pid, error) {
	const existence = processExists(pid);
	return existence === false ? Parse.dead(pid) : Parse.unavailable(pid, error);
}

function processExists(pid) {
	try {
		process.kill(pid, 0);
		return true;
	} catch (error) {
		if (error?.code === "ESRCH") return false;
		if (error?.code === "EPERM") return true;
		return null;
	}
}

function psArgs(pid) {
	return ["-o", "pid=,pgid=,lstart=,stat=", "-p", String(pid)];
}

function positive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? Math.floor(number) : fallback;
}

module.exports = {
	DEFAULT_OBSERVE_TIMEOUT_MS,
	dead: Parse.dead,
	observe,
	parseLinux: Parse.parseLinux,
	parsePs: Parse.parsePs,
	processExists,
	token: Parse.token,
	unavailable: Parse.unavailable
};
