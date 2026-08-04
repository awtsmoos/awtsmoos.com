// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Preserves broad room ideation as a focused, nonblocking collaboration vessel.
 * @description
 * The Awtsmoos lets agents widen possibility before choosing work. Brainstorm records
 * remain durable room context, never create interrupts, and can be read by every peer
 * through the same sequenced room history and mission metadata.
 */
function brainstorm(mission, input, env) {
	const room = env.RoomState.ensure(mission, input);
	const agentId = env.RoomState.agentId(input);
	const count = Math.max(10, Math.min(100, Number(input.count || 25)));
	const ideas = Array.from({ length: count }, (_, index) =>
		`${index + 1}. ${agentId} room idea: ${topic(index)} for ${room.name}`
	);
	const record = {
		id: env.RoomState.id("room_brainstorm"),
		at: env.RoomState.now(),
		agentId,
		prompt: env.RoomState.text(input.prompt || "Brainstorm room coordination before acting"),
		ideas
	};
	room.brainstorms.push(record);
	if (env.MetadataStore && input.disableCentralMetadata !== true) {
		env.MetadataStore.record({
			root: input.__configRoot || input.projectRoot,
			metadataRoot: input.__metadataRoot
		}, mission, "room_brainstorm", {
			agentId,
			message: record.prompt,
			payload: { brainstormId: record.id, ideaCount: ideas.length }
		});
	}
	env.event(mission, "mission_room_brainstorm", record.prompt, {
		roomId: room.id,
		brainstormId: record.id,
		agentId
	});
	return record;
}

function topic(index) {
	return [
		"find active room",
		"join correct mission",
		"send nonblocking progress",
		"answer peer questions",
		"recover blocking interrupt",
		"split workload",
		"create sub-mission",
		"merge reports"
	][index % 8];
}

module.exports = { brainstorm, topic };
