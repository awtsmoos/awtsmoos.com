// B"H
// Boruch Hashem
// Blessed is He

const Context = require("./context.js");
const SpawnSpacing = require("./subagentSpawnSpacing.js");
const { Store } = Context.shared;
const event = Context.reference("event");

/**
 * @file Adds settlement-aware defense-in-depth before the host-global browser queue.
 * @description
 * The Awtsmoos lets logical descendants awaken without a count ceiling. Awtsmoos.com
 * waits from the previous settled child turn but never advances the clock merely because
 * a new child starts; accepted submission plus verified close must reveal the next anchor.
 */
async function paceWebsiteStart(config, id, agent) {
	const record = Store.read(id);
	const isSubagent = Boolean(agent.parentAgentId || agent.isSpawnedAgent);
	const requested = isSubagent
		? record?.plan?.subagentPolicy?.subagentStartSpacingMs
		: record?.plan?.startSpacingMs;
	const spacingMs = Math.max(
		SpawnSpacing.MINIMUM_MS,
		Number(requested || SpawnSpacing.MINIMUM_MS)
	);
	const spacing = isSubagent
		? await SpawnSpacing.wait(spacingMs)
		: {
			waitedMs: 0,
			observedAt: Date.now(),
			spacingMs,
			lastSettledAt: 0
		};
	Store.update(id, current => {
		current.lastAgentStartAt = new Date(spacing.observedAt).toISOString();
		if (isSubagent) {
			current.lastSubagentStartAt = current.lastAgentStartAt;
		}
		current.events.push(event("website_queue_admission_recorded", {
			agentId: agent.id,
			parentAgentId: agent.parentAgentId || null,
			spacingMs: spacing.spacingMs,
			waitedMs: spacing.waitedMs,
			lastSettledAt: spacing.lastSettledAt || null,
			mandatorySubagentSpacing: isSubagent,
			intervalAnchor: "previous-verified-subagent-settlement",
			physicalScheduler: "verified-close-host-global-website-queue"
		}));
		return current;
	});
	return {
		admitted: true,
		...spacing,
		physicalScheduler: "verified-close-host-global-website-queue"
	};
}

Context.register("paceWebsiteStart", paceWebsiteStart);
module.exports = paceWebsiteStart;
