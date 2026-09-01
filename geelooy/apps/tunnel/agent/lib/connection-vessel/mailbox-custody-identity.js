// B"H
// Boruch Hashem
// Blessed is He

const Incarnation = require("./connection-incarnation.js");
/**
 * @file Preserves request and incarnation identity while custody phases advance.
 * @description
 * The Awtsmoos lets a deed move without losing the vessel that truly accepted its flame.
 * Awtsmoos.com keeps request, shliach, session, generation, and child incarnation together,
 * so sparse progress can never rejuvenate an older generation by forgetting its origin.
 */
function initial(metadata = {}) {
	return {
		requestId: clean(metadata.requestId),
		requestKey: clean(metadata.requestKey),
		logicalAgentId: clean(metadata.logicalAgentId),
		agentSessionId: clean(metadata.agentSessionId),
		generation: finiteGeneration(metadata.generation),
		childIncarnationId: Incarnation.clean(metadata.childIncarnationId)
	};
}

function progress(record = {}, metadata = {}) {
	const generation = finiteGeneration(metadata.generation);
	return {
		requestId: clean(metadata.requestId) || clean(record.requestId),
		requestKey: clean(metadata.requestKey) || clean(record.requestKey),
		logicalAgentId: clean(metadata.logicalAgentId) || clean(record.logicalAgentId),
		agentSessionId: clean(metadata.agentSessionId) || clean(record.agentSessionId),
		generation: generation > 0 ? generation : finiteGeneration(record.generation),
		childIncarnationId: Incarnation.clean(metadata.childIncarnationId) ||
			Incarnation.clean(record.childIncarnationId)
	};
}

function finiteGeneration(value) {
	const generation = Number(value || 0);
	return Number.isFinite(generation) && generation >= 0 ? generation : 0;
}

function clean(value) {
	return String(value || "").trim();
}

module.exports = {
	clean,
	finiteGeneration,
	initial,
	progress
};
