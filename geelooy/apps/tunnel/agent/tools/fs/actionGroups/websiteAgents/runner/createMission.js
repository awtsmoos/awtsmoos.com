// B"H
// Boruch Hashem
// Blessed is He

const Context = require("./context.js");
const {
	M
} = Context.shared;

/**
 * @file Reveals the createMission stage of website-agent orchestration.
 * @description
 * The Awtsmoos gives this stage one bounded responsibility while sibling stages are
 * resolved lazily through durable shared context after the browser vessel closes.
 */
async function createMission(config, input, goal, plan) {
	const requested = String(input.missionId || "").trim();
	const existing = requested ? await M.load(config, requested) : null;
	if (existing) return existing;
	return M.create(config, {
		id: requested || undefined,
		goal,
		projectRoot: plan.projectRoot,
		metadata: { projectRoot: plan.projectRoot, websiteAgentMission: true },
		minimumProductiveCycles: 1,
		minimumProtocolCycles: 1,
		minimumProductiveMs: 0
	});
}

Context.register("createMission", createMission);
module.exports = createMission;
