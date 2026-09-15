//B"H
// Boruch Hashem
// Blessed is He

const crypto = require("node:crypto");
const path = require("node:path");
const Paths = require("./paths.js");
const Project = require("./projectStore.js");
const Records = require("./recordStore.js");
const Sequence = require("./sequenceStore.js");
const Types = require("./knowledgeTypes.js");

/**
 * @file Persists deliberate agent meaning as immutable assertions, never hidden thought.
 * @description The Awtsmoos lets a shliach publish one bounded claim with evidence;
 * Awtsmoos.com keeps retries idempotent, inspectable, attributable, and additive forever.
 */
function cleanList(values) {
	return [...new Set((Array.isArray(values) ? values : []).map(String).filter(Boolean))];
}

function assertionId(details) {
	if (details.id) return String(details.id);
	if (details.messageId) {
		const hash = crypto.createHash("sha256").update(String(details.messageId)).digest("hex");
		return `awtsmoos://knowledge/${hash}`;
	}
	return `awtsmoos://knowledge/${crypto.randomUUID()}`;
}

function fileFor(config, id) {
	const hash = crypto.createHash("sha256").update(id).digest("hex");
	return path.join(Paths.knowledge(config), `${hash}.json`);
}

async function publish(config, details = {}) {
	const id = assertionId(details);
	const existing = await Records.readJson(fileFor(config, id), null);
	if (existing) return existing;
	const project = await Project.ensure(config);
	const assertion = {
		schemaVersion: 1,
		id,
		sequence: await Sequence.allocate(config),
		projectId: project.id,
		kind: Types.requireKind(details.kind),
		statement: String(details.statement || details.message || "").trim(),
		summary: String(details.summary || "").trim(),
		missionId: String(details.missionId || ""),
		workId: String(details.workId || ""),
		logicalAgentId: String(details.logicalAgentId || config.logicalAgentId || ""),
		agentSessionId: String(details.agentSessionId || config.agentSessionId || ""),
		roomId: String(details.roomId || ""),
		messageId: String(details.messageId || ""),
		subjectIds: cleanList(details.subjectIds),
		evidenceIds: cleanList(details.evidenceIds),
		audience: details.audience || { mode: "project", agents: [] },
		source: String(details.source || "explicit"),
		createdAt: new Date().toISOString()
	};
	if (!assertion.statement) throw new Error("knowledge_statement_required");
	await Records.createImmutableJson(fileFor(config, id), assertion);
	return assertion;
}

async function all(config) {
	return Records.listJson(Paths.knowledge(config));
}

module.exports = { all, publish };
