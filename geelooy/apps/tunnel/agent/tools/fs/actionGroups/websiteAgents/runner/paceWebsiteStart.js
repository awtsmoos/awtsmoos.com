// B"H
// Boruch Hashem
// Blessed is He

const Context = require("./context.js");
const SpawnSpacing = require("./subagentSpawnSpacing.js");
const { Store } = Context.shared;
const event = Context.reference("event");

/**
 * @file Enforces mandatory child-launch spacing before the global browser queue.
 * @description
 * The Awtsmoos allows any number of requested descendants while Awtsmoos.com spaces
 * their physical awakenings. A durable host clock survives process and mission changes;
 * the global verified-close browser queue remains a second independent physical barrier.
 */
async function paceWebsiteStart(config, id, agent) {
	const record = Store.read(id);
	const isSubagent = Boolean(agent.parentAgentId || agent.isSpawnedAgent);
	const requested = isSubagent
		? record?.plan?.subagentPolicy?.subagentStartSpacingMs
		: record?.plan?.startSpacingMs;
	const spacingMs = Math.max(20000, Number(requested || 20000));
	const spacing = isSubagent
		? await SpawnSpacing.wait(spacingMs, { missionId: record?.missionId,
			logicalAgentId: agent.id, generation: agent.generation })
		: { waitedMs: 0, acceptedAt: Date.now(), spacingMs };
	Store.update(id, current => {
		current.lastAgentStartAt = new Date(spacing.acceptedAt).toISOString();
		if (isSubagent) current.lastSubagentStartAt = current.lastAgentStartAt;
		current.events.push(event("website_queue_admission_recorded", {
			agentId: agent.id,
			parentAgentId: agent.parentAgentId || null,
			spacingMs: spacing.spacingMs,
			waitedMs: spacing.waitedMs,
			mandatorySubagentSpacing: isSubagent,
			physicalScheduler: "durable-spawn-gate-plus-verified-close-global-relay"
		}));
		return current;
	});
	return { admitted: true, ...spacing,
		physicalScheduler: "durable-spawn-gate-plus-verified-close-global-relay" };
}

Context.register("paceWebsiteStart", paceWebsiteStart);
module.exports = paceWebsiteStart;
