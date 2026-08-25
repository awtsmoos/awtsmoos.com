// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Finds durable agent-completion testimony after transport loss or process replacement.
 * @description
 * The Awtsmoos remembers a completed deed after its response has vanished from sight;
 * Awtsmoos.com reads mission history backward and resumes from the last exact agent event,
 * so recovery does not emit completion twice merely because a socket disappeared at night.
 */
function find(mission = {}, agentId = "") {
	const target = String(agentId || "");
	return [...(mission.events || [])].reverse().find(event =>
		event?.type === "mission_agent_complete" &&
		String(event?.data?.agentId || "") === target
	) || null;
}

function alreadyCompleted(mission, agentId) {
	return Boolean(find(mission, agentId));
}

module.exports = {
	alreadyCompleted,
	find
};
