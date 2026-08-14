// B"H
// Boruch Hashem
// Blessed is He

const Circuit = require("../../../../../lib/runtime/circuit-breaker.js");
const RuntimePressure = require("../../../../../lib/runtime/runtime-pressure.js");

const TERMINAL = new Set(["completed", "complete", "submitted", "failed", "cancelled", "canceled"]);
const BLOCKED = new Set(["waiting_for_login", "claim_conflict", "awaiting_recovery"]);

/**
 * @file Governs recursive activation without discarding durable logical intention.
 * @description The Awtsmoos may reveal hundreds of useful children while Awtsmoos.com
 * activates only the portion the present vessel can carry without deepening pressure.
 */
function evaluate(policy = {}, pressure = RuntimePressure.current()) {
	if (pressure?.available === false) {
		return decision("deferred", false, 0, 0, wake(policy.hardPressureWakeMs, 3000),
			"unavailable", pressure, "runtime_pressure_unavailable");
	}
	const pressureMs = Number(pressure?.eventLoopLag?.pressureMs || 0);
	let level = Circuit.levelForLag(pressureMs, Circuit.DEFAULTS);
	if (policy.pressureAwareActivation === false && level === "soft") level = "closed";
	if (level === "panic") return decision("deferred", false, 0, 0, wake(policy.panicPressureWakeMs, 5000), level, pressure);
	if (level === "hard") return decision("deferred", false, 0, 0, wake(policy.hardPressureWakeMs, 3000), level, pressure);
	if (level === "soft") return decision("throttled", true, softQuantum(policy), 1, wake(policy.softPressureWakeMs, 1500), level, pressure);
	return decision("normal", true,
		bounded(policy.spawnDrainQuantum, 4, 1, 16),
		bounded(policy.spawnDrainMaxQuanta, 2, 1, 8),
		wake(policy.spawnDrainWakeMs, 1000), "closed", pressure);
}

function metrics(record = {}) {
	const children = (record.agents || []).filter(agent => agent.parentAgentId);
	const counts = { unseeded: 0, queuedSeeded: 0, seeded: 0, active: 0, blocked: 0, terminal: 0 };
	for (const agent of children) {
		const status = String(agent.status || "queued").toLowerCase();
		if (TERMINAL.has(status)) {
			counts.terminal += 1;
			continue;
		}
		if (agent.roomSeeded === false) {
			counts.unseeded += 1;
			continue;
		}
		counts.seeded += 1;
		if (status === "queued") counts.queuedSeeded += 1;
		else if (BLOCKED.has(status)) counts.blocked += 1;
		else counts.active += 1;
	}
	return {
		totalChildren: children.length,
		backlog: counts.unseeded + counts.queuedSeeded,
		...counts
	};
}

function remember(Store, id, currentDecision) {
	const record = Store.read(id);
	if (!record) return null;
	const next = { ...currentDecision, backlog: metrics(record) };
	if (signature(record.spawnAdmission) === signature(next)) return record.spawnAdmission;
	const updated = Store.update(id, current => {
		current.spawnAdmission = { ...next, observedAt: new Date().toISOString() };
		return current;
	});
	return updated?.spawnAdmission || null;
}

function effectivePolicy(policy = {}, currentDecision = {}) {
	return { ...policy,
		spawnDrainQuantum: currentDecision.quantum,
		spawnDrainMaxQuanta: currentDecision.maxQuanta };
}

function decision(mode, allowActivation, quantum, maxQuanta, wakeMs, level, pressure, reason) {
	return {
		mode, allowActivation, quantum, maxQuanta, wakeMs, level,
		reason: reason || (level === "closed" ? "runtime_pressure_clear" : `runtime_${level}_pressure`),
		pressureLagMs: Number(pressure?.eventLoopLag?.pressureMs || 0),
		pressureObservedAt: pressure?.observedAt || null
	};
}

function signature(snapshot) {
	if (!snapshot) return "";
	return JSON.stringify({
		mode: snapshot.mode, allowActivation: snapshot.allowActivation,
		quantum: snapshot.quantum, maxQuanta: snapshot.maxQuanta,
		wakeMs: snapshot.wakeMs, level: snapshot.level, reason: snapshot.reason,
		backlog: snapshot.backlog || null
	});
}

function softQuantum(policy) {
	return bounded(policy.softPressureQuantum, 1, 1, 2);
}

function wake(value, minimum) {
	const number = Number(value);
	return Math.max(minimum, Math.min(60000, Number.isFinite(number) ? Math.floor(number) : minimum));
}

function bounded(value, fallback, minimum, maximum) {
	const number = Number(value);
	return Number.isFinite(number) ? Math.max(minimum, Math.min(maximum, Math.floor(number))) : fallback;
}

module.exports = { effectivePolicy, evaluate, metrics, remember, signature };
