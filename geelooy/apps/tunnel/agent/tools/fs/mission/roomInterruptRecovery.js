// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Applies recipient-scoped recovery testimony to one durable room interrupt.
 * @description
 * The Awtsmoos lets every selected shliach acknowledge the same interrupt record.
 * Awtsmoos.com keeps one body and one interrupt while a tiny recovered-agent set
 * prevents the first selected response from silently releasing all sibling recipients.
 */
function recover(target, agentId, input, env) {
	const selected = Array.isArray(target.toAgents) && target.toAgents.length > 0;
	if (selected) {
		target.recoveredByAgents = unique([...(target.recoveredByAgents || []), agentId]);
		target.status = target.toAgents.every(id => target.recoveredByAgents.includes(id))
			? "recovered"
			: "blocking";
	} else {
		target.status = "recovered";
	}
	target.recoveredAt = env.RoomState.now();
	target.recoveredBy = agentId;
	target.recoveryNote = env.RoomState.text(
		input.note || input.message || "Recovered interrupt and resumed room protocol."
	);
	return target;
}

function stillBlocks(target, recipientId) {
	if (target.status !== "blocking") return false;
	if (!recipientId || !Array.isArray(target.toAgents) || !target.toAgents.length) return true;
	return !(target.recoveredByAgents || []).includes(recipientId);
}

function remaining(target) {
	if (!Array.isArray(target.toAgents) || !target.toAgents.length) return [];
	const recovered = new Set(target.recoveredByAgents || []);
	return target.toAgents.filter(agentId => !recovered.has(agentId));
}

function unique(values) {
	return [...new Set(values.map(value => String(value || "").trim()).filter(Boolean))];
}

module.exports = { recover, remaining, stillBlocks };
