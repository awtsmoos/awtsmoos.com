// B"H
// Boruch Hashem
// Blessed is He

const Context = require("./context.js");
const {
	C,
	Store
} = Context.shared;
const progress = Context.reference("progress");
const status = Context.reference("status");
const message = Context.reference("message");
const heartbeat = Context.reference("heartbeat");
const event = Context.reference("event");
const withMission = Context.reference("withMission");

/**
 * @file Reveals the publishProgressToRoom stage of website-agent orchestration.
 * @description
 * The Awtsmoos gives this stage one bounded responsibility while sibling stages are
 * resolved lazily through durable shared context after the browser vessel closes.
 */
function publishProgressToRoom(config, record, agent, round, stage, status) {
	void withMission(config, record.missionId, mission => {
		heartbeat(
			mission,
			agent,
			"working",
			`Website turn ${round}: ${stage || "progress"} ${status || "observed"}.`
		);
		if (stage === "website-submit" && ["accepted", "accepted-response"].includes(status)) {
			C.message(mission, {
				agentId: agent.id,
				agentName: agent.name,
				role: agent.role,
				toAgent: "all",
				kind: "website-agent-progress",
				subject: `Website turn ${round} accepted`,
				body: "The ordinary ChatGPT website composer accepted this agent turn. Completion will be read through authenticated GET without resubmitting.",
				references: [agent.scope]
			});
		}
	}).catch(error => {
		Store.update(record.id, current => {
			current.events.push(event("agent_progress_room_update_failed", {
				agentId: agent.id,
				round,
				error: String(error?.message || error).slice(0, 1000)
			}));
			return current;
		});
	});
}

Context.register("publishProgressToRoom", publishProgressToRoom);
module.exports = publishProgressToRoom;
