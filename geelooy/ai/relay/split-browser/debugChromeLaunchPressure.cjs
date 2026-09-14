//B"H
//Boruch Hashem
//Blessed be He

const os = require("node:os");
const { spawnSync } = require("node:child_process");

/**
 * @file Protects the Mac control plane from browser-launch resource cliffs.
 * @description
 * Shared AI Chrome is optional work; Tunnel health and remote recovery are not.
 * A fresh browser tree is therefore deferred whenever existing Chrome activity,
 * automated Chrome roots, or host load already exceed conservative limits.
 */
const DEFAULT_ROOT_LIMIT = 6;

/** Returns bounded host-pressure testimony without reading browser content. */
function measure(options = {}) {
	const cpuCount = Math.max(1, os.cpus()?.length || 1);
	const processText = options.processText ?? readProcesses();
	const chrome = summarizeChrome(processText);
	const loadRatio = Number(os.loadavg?.()[0] || 0) / cpuCount;
	return {
		cpuCount,
		loadRatio,
		chromeCpu: chrome.cpu,
		chromeRootCount: chrome.roots
	};
}
/** Returns whether a new Shared AI Chrome tree may be born safely right now. */
function allowSpawn(options = {}) {
	const state = measure(options);
	const maxChromeCpu = numberOption(
		options.maxChromeCpu,
		process.env.AWTSMOOS_SHARED_CHROME_MAX_HOST_CPU,
		Math.max(100, state.cpuCount * 30)
	);
	const maxRootCount = numberOption(
		options.maxRootCount,
		process.env.AWTSMOOS_SHARED_CHROME_MAX_ROOTS,
		DEFAULT_ROOT_LIMIT
	);
	const maxLoadRatio = numberOption(
		options.maxLoadRatio,
		process.env.AWTSMOOS_SHARED_CHROME_MAX_LOAD_RATIO,
		2
	);
	const reasons = [];
	if (state.chromeCpu >= maxChromeCpu) reasons.push("chrome_cpu_pressure");
	if (state.chromeRootCount >= maxRootCount) reasons.push("chrome_root_pressure");
	if (state.loadRatio >= maxLoadRatio) reasons.push("host_load_pressure");
	return {
		ok: reasons.length === 0,
		...state,
		limits: { maxChromeCpu, maxRootCount, maxLoadRatio },
		reasons
	};
}
function summarizeChrome(text = "") {
	let cpu = 0;
	let roots = 0;
	for (const line of String(text).split(/\r?\n/)) {
		const match = line.trim().match(/^([0-9.]+)\s+(.+)$/);
		if (!match) continue;
		const command = match[2];
		if (!/Google Chrome/.test(command)) continue;
		cpu += Number(match[1]) || 0;
		if (/Google Chrome\.app\/Contents\/MacOS\/Google Chrome\b/.test(command) &&
			/--user-data-dir=/.test(command)) roots += 1;
	}
	return { cpu: Math.round(cpu * 10) / 10, roots };
}

function readProcesses() {
	const result = spawnSync("ps", ["ax", "-o", "%cpu=,command="], {
		encoding: "utf8",
		timeout: 1500
	});
	return result.status === 0 ? result.stdout : "";
}

function numberOption(first, second, fallback) {
	for (const candidate of [first, second, fallback]) {
		const value = Number(candidate);
		if (Number.isFinite(value) && value > 0) return value;
	}
	return fallback;
}

module.exports = { allowSpawn, measure, summarizeChrome };
