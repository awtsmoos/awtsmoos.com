// B"H
// Boruch Hashem
// Blessed is He

const Context = require("./context.js");
const { C } = Context.shared;

/**
 * @file Announces child creation and renews its queued heartbeat.
 * @description
 * The Awtsmoos lets every peer see plan, progress, handoff, and pending completion.
 * Awtsmoos.com emits the creation message once while heartbeats remain renewable.
 */
function announceChildRoom(mission, child) {
	const subject = `${child.id} created at depth ${child.depth}`;
	const messages = mission.collaboration?.messages || [];
	const exists = messages.some(message =>
		message.kind === "website-subagent-created" && message.subject === subject
	);
	if (!exists) {
		C.message(mission, {
			agentId: child.parentAgentId,
			toAgent: "all",
			kind: "website-subagent-created",
			subject,
			body: [
				`PLAN: ${child.assignmentPrompt}`,
				"PROGRESS: child admitted and queued for the paced website start lane.",
				`HANDOFF: parent=${child.parentAgentId}; scope=${child.scope}; request=${child.spawnRequestKey}.`,
				"COMPLETION: pending child evidence."
			].join("\n"),
			references: [child.scope]
		});
	}
	C.heartbeat(mission, {
		agentId: child.id,
		agentName: child.name,
		role: child.role,
		status: "queued",
		currentAction: "Waiting for paced website turn",
		files: [child.scope],
		note: `Spawned by ${child.parentAgentId} at depth ${child.depth}.`
	});
}

module.exports = announceChildRoom;
