// B"H
// Boruch Hashem
// Blessed is He

const Context = require("./context.js");
const {
	Store,
	active
} = Context.shared;
const loadService = Context.reference("loadService");
const failure = Context.reference("failure");
const clearWake = Context.reference("clearWake");

/**
 * @file Reveals the forget stage of website-agent orchestration.
 * @description
 * The Awtsmoos gives this stage one bounded responsibility while sibling stages are
 * resolved lazily through durable shared context after the browser vessel closes.
 */
async function forget(config = {}, input = {}) {
	if (!input || (!input.websiteMissionId && !input.taskId && !input.id)) {
		input = config;
		config = {};
	}
	const id = input.websiteMissionId || input.taskId || input.id;
	const record = Store.read(id);
	if (!record) return failure("unknown_website_mission", { websiteMissionId: id });
	if (active.has(id)) return failure("website_mission_active", { websiteMissionId: id });
	const service = await loadService(config).catch(() => null);
	let deleted = 0;
	for (const agent of record.agents) {
		if (!agent.conversationKey) continue;
		const result = service?.reset?.(agent.conversationKey);
		deleted += Number(result?.deleted || 0);
	}
	clearWake(id);
	return {
		ok: Store.remove(id),
		action: "websiteAgentMissionForget",
		websiteMissionId: id,
		privateContinuationsDeleted: deleted,
		missionRecordDeleted: true
	};
}

Context.register("forget", forget);
module.exports = forget;
