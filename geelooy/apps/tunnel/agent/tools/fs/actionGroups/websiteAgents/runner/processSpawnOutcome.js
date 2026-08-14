// B"H
// Boruch Hashem
// Blessed is He

const Context = require("./context.js");
const {
	C,
	Store,
	Spawning
} = Context.shared;
const seedPendingChildren = Context.reference("seedPendingChildren");
const status = Context.reference("status");
const message = Context.reference("message");
const event = Context.reference("event");
const withMission = Context.reference("withMission");

/**
 * @file Reveals the processSpawnOutcome stage of website-agent orchestration.
 * @description
 * The Awtsmoos gives this stage one bounded responsibility while sibling stages are
 * resolved lazily through durable shared context after the browser vessel closes.
 */
async function processSpawnOutcome(config, id, parentAgentId, outcome = {}) {
	const requests = Array.isArray(outcome.spawnRequests) ? outcome.spawnRequests : [];
	const diagnostics = Array.isArray(outcome.spawnDiagnostics) ? outcome.spawnDiagnostics : [];
	if (!requests.length && !diagnostics.length) return;
	const diagnosticCounts = diagnostics.reduce((counts, item) => {
		const code = String(item?.code || "unknown_spawn_diagnostic").slice(0, 120);
		counts[code] = Number(counts[code] || 0) + 1;
		return counts;
	}, {});
	if (diagnostics.length) {
		Store.update(id, record => {
			record.events.push(event("subagent_spawn_diagnostics", {
				parentAgentId,
				counts: diagnosticCounts,
				total: diagnostics.length
			}));
			return record;
		});
	}
	const admission = Spawning.admit(id, parentAgentId, requests);
	await seedPendingChildren(config, id);
	if (!admission.accepted.length && !admission.duplicates.length &&
		!admission.rejected.length && !diagnostics.length) return;
	const record = Store.read(id);
	const parent = record?.agents.find(agent => agent.id === parentAgentId);
	if (!record || !parent) return;
	await withMission(config, record.missionId, mission => {
		C.message(mission, {
			agentId: parent.id,
			agentName: parent.name,
			role: parent.role,
			toAgent: "all",
			kind: "website-subagent-spawn-result",
			subject: `${admission.accepted.length} sub-agent request(s) admitted; ${admission.duplicates.length} duplicate(s) suppressed`,
			body: [
				`PLAN: fan out ${admission.accepted.length} independent scoped request(s).`,
				`PROGRESS: stable children ${admission.accepted.map(item => item.childAgentId).join(", ") || "none"}; duplicate requests safely suppressed=${admission.duplicates.map(item => item.requestKey).join(", ") || "none"}.`,
				`HANDOFF: ${admission.rejected.map(item => `${item.requestKey || "invalid"}:${item.reason}`).join(", ") || "no rejected requests"}; diagnostics=${JSON.stringify(diagnosticCounts)}.`,
				"COMPLETION: each admitted child must publish its own verified completion or exact NEXT handoff."
			].join("\n"),
			references: admission.accepted.map(item => item.scope)
		});
		return C.status(mission);
	});
}

Context.register("processSpawnOutcome", processSpawnOutcome);
module.exports = processSpawnOutcome;
