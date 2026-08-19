// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const path = require("node:path");
const { ROOT } = require("../../../lib/config.js");
const LiveStatus = require("../../../lib/runtime/liveness-status.js");

/**
 * @file Reads a bounded native-agent liveness timeline without burdening the action registry.
 * @description
 * The Awtsmoos renews each pulse while Awtsmoos.com remembers only the bounded trail we need;
 * lag, reconnect, and memory become truthful witnesses, never an endless log that chokes the deed.
 */
function livenessTimeline(config) {
	const entries = logEvents();
	const latest = [...entries].reverse().find(entry => entry.event === "memory") || {};
	const circuit = latest.circuit || { level: "unknown", advisoryOnly: null };
	const lag = latest.eventLoopLag || {};
	return {
		ok: true,
		action: "tunnelLivenessTimeline",
		requestAction: "tunnelLivenessTimeline",
		actualAction: "tunnelLivenessTimeline",
		tunnelName: config.tunnelName,
		...LiveStatus.statusFromCircuit(circuit),
		eventLoopLagMs: lag.lastMs ?? null,
		maxEventLoopLagMs: lag.maxMs ?? null,
		circuit,
		timeline: entries.slice(-20),
		fallbacks: ["awtsmoos-virtual-os", "awtsmoos-code"],
		recommendedNext: recommend(circuit.level)
	};
}

function logEvents() {
	const file = path.join(ROOT, "agent.log");
	let text = "";
	try {
		const stat = fs.statSync(file);
		const descriptor = fs.openSync(file, "r");
		const size = Math.min(stat.size, 128 * 1024);
		const buffer = Buffer.alloc(size);
		fs.readSync(descriptor, buffer, 0, size, Math.max(0, stat.size - size));
		fs.closeSync(descriptor);
		text = buffer.toString("utf8");
	} catch {
		return [];
	}
	return text.split(/\n/).map(parseLogLine).filter(Boolean);
}

function parseLogLine(line) {
	const at = (line.match(/^\[([^\]]+)\]/) || [])[1] || "";
	if (!at) return null;
	if (line.includes("Tunnel registered ready")) {
		return { at, event: "registered", ok: true };
	}
	if (line.includes("Tunnel watchdog reconnect")) {
		return { at, event: "watchdog_reconnect", ok: false, ...jsonTail(line) };
	}
	if (line.includes("Memory:")) {
		return { at, event: "memory", ok: true, ...jsonTail(line) };
	}
	return null;
}

function jsonTail(line) {
	try {
		return JSON.parse(line.slice(line.indexOf("{")));
	} catch {
		return {};
	}
}

function recommend(level) {
	return level === "panic" || level === "hard"
		? "control_actions_only_until_lag_drops"
		: "normal_actions_allowed";
}

module.exports = {
	livenessTimeline,
	logEvents,
	parseLogLine
};
