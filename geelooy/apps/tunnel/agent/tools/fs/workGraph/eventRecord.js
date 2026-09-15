//B"H
// Boruch Hashem
// Blessed is He

const Ids = require("./ids.js");
const Redaction = require("./redaction.js");

/**
 * @file Defines immutable objective event records without confusing facts and meaning.
 * @description The deed is one vessel and interpretation another; the Awtsmoos
 * illuminates both, while Awtsmoos.com keeps their boundaries clear forever.
 */
function array(value) {
	return Array.isArray(value) ? value.filter(Boolean) : [];
}

function normalize(proposal = {}) {
	return {
		schemaVersion: 1,
		id: String(proposal.id || ""),
		type: String(proposal.type || "event.unknown"),
		projectId: String(proposal.projectId || ""),
		operationId: String(proposal.operationId || ""),
		actor: Redaction.sanitize(proposal.actor || {}),
		missionId: String(proposal.missionId || ""),
		workId: String(proposal.workId || ""),
		subjects: array(proposal.subjects),
		facts: Redaction.sanitize(proposal.facts || {}),
		causalParents: array(proposal.causalParents),
		evidence: array(proposal.evidence),
		sensitivity: String(proposal.sensitivity || "project"),
		retention: String(proposal.retention || "long"),
		semanticKnowledgeId: String(proposal.semanticKnowledgeId || "")
	};
}

function proposalHash(proposal) {
	return Ids.sha256(JSON.stringify(normalize(proposal)));
}

function build(proposal, sequence) {
	const normalized = normalize(proposal);
	if (!normalized.id) throw new Error("work_graph_event_id_required");
	return {
		...normalized,
		sequence,
		time: new Date().toISOString(),
		proposalHash: proposalHash(normalized)
	};
}

module.exports = { build, normalize, proposalHash };
