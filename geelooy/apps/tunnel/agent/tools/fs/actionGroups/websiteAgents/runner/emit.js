// B"H
// Boruch Hashem
// Blessed is He

const Context = require("./context.js");
const {
	ActionStream
} = Context.shared;
const status = Context.reference("status");
const message = Context.reference("message");

/**
 * @file Reveals the emit stage of website-agent orchestration.
 * @description
 * The Awtsmoos gives this stage one bounded responsibility while sibling stages are
 * resolved lazily through durable shared context after the browser vessel closes.
 */
function emit(config, record, agent, phase, extra = {}) {
	ActionStream.emit(config, {
		phase,
		action: "websiteAgentMission",
		kind: "chatgpt-website",
		status: extra.status,
		message: `${agent.name}: ${extra.stage || extra.status || phase}`,
		payload: {
			action: "websiteAgentMission",
			kind: "chatgpt-website",
			missionId: record.missionId,
			logicalAgentId: agent.id,
			agentSessionId: agent.agentSessionId,
			projectRoot: record.plan.projectRoot
		},
		result: {
			ok: extra.status !== "failed",
			action: "websiteAgentMission",
			status: extra.status
		}
	});
}

Context.register("emit", emit);
module.exports = emit;
