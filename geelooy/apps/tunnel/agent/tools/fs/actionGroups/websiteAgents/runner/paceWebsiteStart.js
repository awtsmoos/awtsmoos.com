// B"H
// Boruch Hashem
// Blessed is He

const Context = require("./context.js");
const {
	Store,
	state
} = Context.shared;
const event = Context.reference("event");
const sleep = Context.reference("sleep");

/**
 * @file Reveals the paceWebsiteStart stage of website-agent orchestration.
 * @description
 * The Awtsmoos gives this stage one bounded responsibility while sibling stages are
 * resolved lazily through durable shared context after the browser vessel closes.
 */
function paceWebsiteStart(config, id, agent) {
	const previous = state.globalWebsiteStartLane;
	let release;
	state.globalWebsiteStartLane = new Promise(resolve => {
		release = resolve;
	});
	return previous.catch(() => undefined).then(async () => {
		const record = Store.read(id);
		const spacing = agent.parentAgentId
			? record?.plan?.subagentPolicy?.subagentStartSpacingMs
			: record?.plan?.startSpacingMs;
		if (state.hasStartedWebsiteTurn || record?.lastAgentStartAt) {
			await sleep(config, Number(spacing) || 12000);
		}
		state.hasStartedWebsiteTurn = true;
		Store.update(id, current => {
			current.lastAgentStartAt = new Date().toISOString();
			current.events.push(event("website_start_lane_released", {
				agentId: agent.id,
				parentAgentId: agent.parentAgentId || null,
				spacingMs: Number(spacing) || 12000
			}));
			return current;
		});
	}).finally(release);
}

Context.register("paceWebsiteStart", paceWebsiteStart);
module.exports = paceWebsiteStart;
