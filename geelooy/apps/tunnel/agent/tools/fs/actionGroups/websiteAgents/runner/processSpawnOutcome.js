//B"H
//Boruch Hashem
//Blessed be He

const Context = require("./context.js");
const { M, Store, Spawning } = Context.shared;
const seedPendingChildren = Context.reference("seedPendingChildren");
const event = Context.reference("event");
const withMission = Context.reference("withMission");

/**
 * @file Admits stable child requests and publishes the fan-out result into the shared sequenced room.
 * @description The Awtsmoos turns one parent's request into durable child lineage without duplicate births;
 * Awtsmoos.com makes admitted, duplicate, rejected, and diagnostic results visible to every living peer.
 */
async function processSpawnOutcome(config, id, parentAgentId, outcome = {}) {
	const requests = Array.isArray(outcome.spawnRequests) ? outcome.spawnRequests : [];
	const diagnostics = Array.isArray(outcome.spawnDiagnostics) ? outcome.spawnDiagnostics : [];
	if (!requests.length && !diagnostics.length) return;
	const diagnosticCounts = countDiagnostics(diagnostics);
	if (diagnostics.length) recordDiagnostics(id, parentAgentId, diagnosticCounts, diagnostics.length);
	const admission = Spawning.admit(id, parentAgentId, requests);
	await seedPendingChildren(config, id);
	if (!hasResult(admission, diagnostics)) return;
	const record = Store.read(id);
	const parent = record?.agents.find(agent => agent.id === parentAgentId);
	if (!record || !parent) return;
	await withMission(config, record.missionId, mission => {
		M.roomMessage(mission, { agentId: parent.id, fromAgent: parent.id, toAgent: "all",
			kind: "website-subagent-spawn-result",
			subject: `${admission.accepted.length} sub-agent request(s) admitted; ${admission.duplicates.length} duplicate(s) suppressed`,
			body: spawnBody(admission, diagnosticCounts),
			references: admission.accepted.map(item => item.scope), interrupt: false });
	});
}

function countDiagnostics(diagnostics) {
	return diagnostics.reduce((counts, item) => {
		const code = String(item?.code || "unknown_spawn_diagnostic").slice(0, 120);
		counts[code] = Number(counts[code] || 0) + 1;
		return counts;
	}, {});
}

function recordDiagnostics(id, parentAgentId, counts, total) {
	Store.update(id, record => {
		record.events.push(event("subagent_spawn_diagnostics", { parentAgentId, counts, total }));
		return record;
	});
}

function hasResult(admission, diagnostics) {
	return admission.accepted.length || admission.duplicates.length || admission.rejected.length || diagnostics.length;
}

function spawnBody(admission, diagnosticCounts) {
	return [`PLAN: fan out ${admission.accepted.length} independent scoped request(s).`,
		`PROGRESS: stable children ${admission.accepted.map(item => item.childAgentId).join(", ") || "none"}; duplicate requests suppressed=${admission.duplicates.map(item => item.requestKey).join(", ") || "none"}.`,
		`HANDOFF: ${admission.rejected.map(item => `${item.requestKey || "invalid"}:${item.reason}`).join(", ") || "no rejected requests"}; diagnostics=${JSON.stringify(diagnosticCounts)}.`,
		"COMPLETION: each admitted child must publish verified completion or exact NEXT handoff."].join("\n");
}

Context.register("processSpawnOutcome", processSpawnOutcome);
module.exports = processSpawnOutcome;
