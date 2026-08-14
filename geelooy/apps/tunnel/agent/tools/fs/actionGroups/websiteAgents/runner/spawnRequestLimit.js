// B"H
// Boruch Hashem
// Blessed is He

const Context = require("./context.js");

/**
 * @file Reveals the spawnRequestLimit stage of website-agent orchestration.
 * @description
 * The Awtsmoos gives this stage one bounded responsibility while sibling stages are
 * resolved lazily through durable shared context after the browser vessel closes.
 */
function spawnRequestLimit(record = {}, agent = {}) {
	const policy = record.plan?.subagentPolicy || {};
	if (policy.allowRecursiveSubagents === false) return 0;
	const perParent = Math.max(0, Number(policy.maxSubagentsPerAgent || 32) -
		Number(agent.childAgentIds?.length || 0));
	const globalRemaining = Math.max(0, Number(policy.maxTotalWebsiteAgents || 256) -
		Number(record.agents?.length || 0));
	return Math.min(96, perParent, globalRemaining);
}

Context.register("spawnRequestLimit", spawnRequestLimit);
module.exports = spawnRequestLimit;
