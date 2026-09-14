//B"H
//Boruch Hashem
//Blessed be He

const Context = require("./context.js");
const { M } = Context.shared;

/**
 * @file Announces spawned-child admission and liveness in the sequenced room.
 * @description The Awtsmoos lets every peer see which child entered, why, and whose request begot it;
 * Awtsmoos.com renews heartbeat without duplicating the durable creation announcement.
 */
function announceChildRoom(mission, child) {
	const subject = `${child.id} created at depth ${child.depth}`;
	const exists = (mission.room?.messages || []).some(message =>
		message.kind === "website-subagent-created" && message.subject === subject);
	if (!exists) {
		M.roomMessage(mission, { agentId: child.parentAgentId, fromAgent: child.parentAgentId,
			toAgent: "all", kind: "website-subagent-created", subject,
			body: [`PLAN: ${child.assignmentPrompt}`,
				"PROGRESS: child admitted and queued for the paced website start lane.",
				`HANDOFF: parent=${child.parentAgentId}; scope=${child.scope}; request=${child.spawnRequestKey}.`,
				"COMPLETION: pending child evidence."].join("\n"),
			references: [child.scope], interrupt: false });
	}
	M.roomHeartbeat(mission, { agentId: child.id, logicalAgentId: child.logicalAgentId || child.id,
		spawnGroupId: child.spawnGroupId, status: "queued", currentAction: "Waiting for paced website turn",
		files: [child.scope], note: `Spawned by ${child.parentAgentId} at depth ${child.depth}.` });
}

module.exports = announceChildRoom;
