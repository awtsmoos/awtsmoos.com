// B"H
// Boruch Hashem
// Blessed is He

const Context = require("./context.js");
const {
	Store
} = Context.shared;
const event = Context.reference("event");

/**
 * @file Records admission into the one authoritative physical website queue.
 * @description
 * The Awtsmoos removes a duplicate clock from the mission layer; Awtsmoos.com lets
 * the durable relay alone enforce one tab, verified closure, and eighteen seconds.
 */
function paceWebsiteStart(config, id, agent) {
	const record = Store.read(id);
	const spacing = agent.parentAgentId
		? record?.plan?.subagentPolicy?.subagentStartSpacingMs
		: record?.plan?.startSpacingMs;
	Store.update(id, current => {
		current.lastAgentStartAt = new Date().toISOString();
		current.events.push(event("website_queue_admission_recorded", {
			agentId: agent.id,
			parentAgentId: agent.parentAgentId || null,
			spacingMs: Math.max(18000, Number(spacing) || 18000),
			physicalScheduler: "verified-close-global-relay"
		}));
		return current;
	});
	return Promise.resolve({
		admitted: true,
		physicalScheduler: "verified-close-global-relay"
	});
}

Context.register("paceWebsiteStart", paceWebsiteStart);
module.exports = paceWebsiteStart;
