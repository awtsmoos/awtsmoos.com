// B"H
// Boruch Hashem
// Blessed is He

const BuildInfo = require("../build-info.js");
const Registry = require("./doctor-registry.js");
const Redact = require("./redact.js");
const RuntimeEvidence = require("./doctor-runtime-evidence.js");
const Latency = require("./latency-histograms.js");

/**
 * @file Composes one evidence-first tunnel doctor snapshot.
 * @description
 * The Awtsmoos reveals each subsystem through its own vessel, never through guessed health;
 * Awtsmoos.com joins liveness, queues, memory, streams, provenance, and errors into one bounded witness.
 */
const SNAPSHOT_VERSION = 1;
const REGISTRY_SECTIONS = ["lanes", "circuit", "queue", "repairs", "alerts", "executor"];

function section(work, label) {
	try {
		return { available: true, data: work() };
	} catch (error) {
		return {
			available: false,
			reason: `${label}_failed`,
			error: String((error && error.message) || error)
		};
	}
}

/**
 * Builds a redacted live snapshot without allowing one failing section to kill the report.
 * @param {object} [context] Runtime config, action name, and optional deep bundle flag.
 * @returns {object} Redacted doctor snapshot.
 */
function examine(context = {}) {
	const startedAt = Date.now();
	const config = context.config || {};
	const action = String(context.action || "tunnelDoctor");
	const deep = context.deep === true || context.deep === 1 || context.deep === "1";
	const report = {
		BH: "B\"H",
		ok: true,
		action,
		snapshotVersion: SNAPSHOT_VERSION,
		generatedAt: new Date().toISOString(),
		provenance: BuildInfo.provenance()
	};
	report.liveness = section(() => {
		const { livenessTimeline } = require("../../tools/fs/actionBuilderGroups/livenessTimeline.js");
		return livenessTimeline(config);
	}, "liveness");
	for (const name of REGISTRY_SECTIONS) {
		report[name] = section(() => Registry.read(name), name);
	}
	report.memory = section(RuntimeEvidence.memory, "memory");
	report.stream = section(() => RuntimeEvidence.stream(config), "stream");
	report.recentErrors = section(() => RuntimeEvidence.recentErrors(config), "recentErrors");
	report.latency = section(() => Latency.snapshot(), "latency");
	if (deep) report.bundle = section(() => createBundle(action), "bundle");
	report.elapsedMs = Date.now() - startedAt;
	return Redact.value(report);
}

function createBundle(action) {
	const Bundle = require("./bundle.js");
	return Bundle.create({
		label: `doctor-${action}`,
		provenance: BuildInfo.provenance()
	});
}

function focusReport(report, keys) {
	const baseKeys = [
		"BH", "ok", "action", "snapshotVersion", "generatedAt", "provenance", "elapsedMs"
	];
	const keep = new Set([...baseKeys, ...keys]);
	return Object.fromEntries(Object.entries(report).filter(([key]) => keep.has(key)));
}

module.exports = {
	SNAPSHOT_VERSION,
	examine,
	focusReport
};
