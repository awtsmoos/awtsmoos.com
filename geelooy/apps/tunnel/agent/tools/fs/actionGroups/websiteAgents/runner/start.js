// B"H
// Boruch Hashem
// Blessed is He

const Context = require("./context.js");
const {
	Planner,
	Store
} = Context.shared;
const schedule = Context.reference("schedule");
const message = Context.reference("message");
const createMission = Context.reference("createMission");
const seedRoom = Context.reference("seedRoom");
const failure = Context.reference("failure");

/**
 * @file Reveals the start stage of website-agent orchestration.
 * @description
 * The Awtsmoos gives this stage one bounded responsibility while sibling stages are
 * resolved lazily through durable shared context after the browser vessel closes.
 */
async function start(config, input = {}) {
	const goal = String(input.prompt || input.goal || input.message || "").trim();
	if (!goal) return failure("missing_goal");
	const requestedId = input.websiteMissionId || input.taskId || input.id;
	if (requestedId && Store.read(requestedId)) {
		return failure("website_mission_already_exists", {
			websiteMissionId: requestedId,
			resume: { action: "websiteAgentMissionStatus", websiteMissionId: requestedId }
		});
	}
	const plan = Planner.plan(config, input);
	const mission = await createMission(config, input, goal, plan);
	const record = Store.create({
		id: requestedId,
		goal,
		missionId: mission.id,
		plan
	});
	await seedRoom(config, mission, record);
	schedule(config, record.id);
	return {
		ok: true,
		action: "websiteAgentMissionStart",
		websiteOnly: true,
		nonBlocking: true,
		mission: Store.publicRecord(Store.read(record.id)),
		leadInstruction: record.lead.instruction,
		authenticationPolicy: "Saved session first; one visible manual login when needed; lead work never blocks.",
		roomDeliveryPolicy: "Messages are durable and live in Tunnel Control; busy website turns consume them on the next safe composer turn.",
		check: { action: "websiteAgentMissionStatus", websiteMissionId: record.id }
	};
}

Context.register("start", start);
module.exports = start;
