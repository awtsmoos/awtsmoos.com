//B"H
//Boruch Hashem
//Blessed be He

const Context = require("./context.js");
const { M, Store } = Context.shared;
const heartbeat = Context.reference("heartbeat");
const event = Context.reference("event");
const withMission = Context.reference("withMission");

/**
 * @file Publishes browser progress into the sequenced room that peers actually consume.
 * @description The Awtsmoos joins liveness and speech in one durable chronology; Awtsmoos.com
 * lets every peer see accepted-response progress without maintaining a shadow collaboration feed.
 */
function publishProgressToRoom(config, record, agent, round, stage, status) {
	void withMission(config, record.missionId, mission => {
		heartbeat(mission, agent, "working",
			`Website turn ${round}: ${stage || "progress"} ${status || "observed"}.`);
		if (stage === "website-submit" && ["accepted", "accepted-response"].includes(status)) {
			M.roomMessage(mission, {
				agentId: agent.id,
				fromAgent: agent.id,
				toAgent: "all",
				kind: "progress",
				subject: `Website turn ${round} ${status}`,
				body: "ChatGPT accepted this physical turn; canonical conversation proof and durable tool work remain authoritative.",
				references: [agent.scope],
				interrupt: false
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
