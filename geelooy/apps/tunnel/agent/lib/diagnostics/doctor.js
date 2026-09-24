// B"H
// Boruch Hashem
// Blessed is He

const os = require("node:os");
const path = require("node:path");
const fs = require("node:fs");
const BuildInfo = require("../build-info.js");
const Registry = require("./doctor-registry.js");
const Redact = require("./redact.js");
const Stream = require("../runtime/action-stream.js");
const Latency = require("./latency-histograms.js");
const Device = require("../../tools/fs/deviceStateRoot.js");

/**
 * @file Real doctor snapshot: every number comes from a live check.
 * @description
 * tunnelDoctor, agentDoctor, and runtimeSnapshot all funnel here. Liveness is
 * the composed liveness timeline; lanes/queue/circuit/repairs/alerts/executor
 * come from the doctor registry (unregistered providers are reported as
 * unavailable, never invented); memory, the action-stream trail, and the
 * latency histograms are read directly. The whole snapshot is redacted before
 * it leaves, and any single failing section degrades instead of killing the
 * report. ?deep=1 attaches a full redacted incident bundle.
 */

const SNAPSHOT_VERSION = 1;
const REGISTRY_SECTIONS = ["lanes", "circuit", "queue", "repairs", "alerts", "executor"];
const RECENT_ERROR_LIMIT = 20;

/** Runs one section; a failure degrades to available:false, never throws. */
function section(fn, label) {
	try {
		return { available: true, data: fn() };
	} catch (error) {
		return {
			available: false,
			reason: `${label}_failed`,
			error: String((error && error.message) || error)
		};
	}
}

function memorySection() {
	const usage = process.memoryUsage();
	return {
		rssBytes: usage.rss,
		heapUsedBytes: usage.heapUsed,
		heapTotalBytes: usage.heapTotal,
		externalBytes: usage.external,
		arrayBuffersBytes: usage.arrayBuffers || 0,
		systemFreeBytes: os.freemem(),
		systemTotalBytes: os.totalmem(),
		loadAverage: os.loadavg(),
		uptimeSeconds: Math.round(process.uptime())
	};
}

function streamSection(config) {
	const file = Stream.streamPath(config);
	const childFile = Stream.childStreamPath(config);
	return {
		path: file,
		childPath: childFile,
		bytes: sizeOf(file),
		childBytes: sizeOf(childFile)
	};
}

function sizeOf(file) {
	try {
		return fs.statSync(file).size;
	} catch {
		return 0;
	}
}

function recentErrors(config) {
	try {
		const rows = Stream.list(config, { phase: "action.error", limit: RECENT_ERROR_LIMIT });
		return rows.map(row => ({
			createdAt: row.createdAt,
			action: row.action,
			traceId: row.traceId,
			error: row.error,
			lane: row.lane
		}));
	} catch {
		return [];
	}
}

/**
 * Composes the real snapshot. Never throws; every section is independent.
 * @param {object} [ctx] {config, action, deep}
 */
function examine(ctx = {}) {
	const startedAt = Date.now();
	const config = ctx.config || {};
	const action = String(ctx.action || "tunnelDoctor");
	const deep = ctx.deep === true || ctx.deep === 1 || ctx.deep === "1";
	const report = {
		BH: "B\"H",
		ok: true,
		action,
		snapshotVersion: SNAPSHOT_VERSION,
		generatedAt: new Date().toISOString(),
		provenance: BuildInfo.provenance()
	};

	// Real liveness: the composed timeline, bounded and live.
	report.liveness = section(() => {
		const { livenessTimeline } = require("../../tools/fs/actionBuilderGroups/livenessTimeline.js");
		return livenessTimeline(config);
	}, "liveness");

	// Live subsystems via the registry; absent providers stay absent.
	for (const name of REGISTRY_SECTIONS) {
		report[name] = section(() => Registry.read(name), name);
	}

	report.memory = section(memorySection, "memory");
	report.stream = section(() => streamSection(config), "stream");
	report.recentErrors = section(() => recentErrors(config), "recentErrors");
	report.latency = section(() => Latency.snapshot(), "latency");

	if (deep) {
		report.bundle = section(() => {
			const Bundle = require("./bundle.js");
			return Bundle.create({
				label: `doctor-${action}`,
				provenance: BuildInfo.provenance()
			});
		}, "bundle");
	}

	report.elapsedMs = Date.now() - startedAt;
	return Redact.value(report);
}

/**
 * Focused aliases for the cognition surface: agentDoctor trims to agent-owned
 * sections, runtimeSnapshot trims to runtime sections; both share examine().
 */
function focusReport(report, keys) {
	const keep = new Set(["BH", "ok", "action", "snapshotVersion", "generatedAt", "provenance", "elapsedMs", ...keys]);
	return Object.fromEntries(
		Object.entries(report).filter(([key]) => keep.has(key))
	);
}

module.exports = {
	SNAPSHOT_VERSION,
	examine,
	focusReport
};
