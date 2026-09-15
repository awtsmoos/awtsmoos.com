//B"H
// Boruch Hashem
// Blessed is He

const Store = require("./recordStore.js");
const ProjectSnapshot = require("../../../tools/fs/virtualOsProject/snapshot.js");
const Compiler = require("../../../tools/fs/contextCompiler/compiler.js");

/**
 * @file Creates immutable Workspace Snapshots from published graph truth and exact source hashes.
 * @description The Awtsmoos preserves causal project state without copying private Room/chat
 * transcripts or disposable sessions; Awtsmoos.com records stable IDs, work, meaning, debt, and files.
 */
function compactWork(item = {}) {
	return {
		id: item.id || "",
		title: item.title || item.summary || "",
		state: item.state || "",
		owner: item.owner || item.logicalAgentId || ""
	};
}

function compactKnowledge(item = {}) {
	return {
		id: item.id || "",
		kind: item.kind || "",
		statement: item.statement || "",
		summary: item.summary || "",
		sequence: Number(item.sequence || 0),
		missionId: item.missionId || "",
		workId: item.workId || ""
	};
}

function compactObligation(item = {}) {
	return {
		obligationId: item.obligationId || "",
		title: item.title || "",
		state: item.state || "",
		workId: item.workId || ""
	};
}

function sourceDescriptor(source = {}) {
	return {
		id: source.id,
		type: source.type,
		contentHash: source.contentHash,
		version: source.version,
		sequence: Number(source.sequence || 0),
		mandatory: Boolean(source.mandatory),
		metadata: source.metadata || {}
	};
}

async function material(config, payload = {}) {
	const snapshot = await ProjectSnapshot.build(config, payload);
	const compiled = await Compiler.compile(config, {
		...payload,
		query: payload.query || "workspace snapshot files work decisions failures obligations",
		includeGraph: true,
		charBudget: Number(payload.charBudget || 50000)
	});
	return {
		version: 1,
		projectId: snapshot.project?.id || snapshot.project?.projectId || "",
		mission: snapshot.mission ? {
			id: snapshot.mission.id,
			status: snapshot.mission.status || "",
			goal: snapshot.mission.goal || snapshot.mission.title || ""
		} : null,
		work: (snapshot.work || []).map(compactWork),
		knowledge: (snapshot.knowledge || []).map(compactKnowledge),
		obligations: (snapshot.obligations || []).map(compactObligation),
		completionDebt: snapshot.debt ? {
			green: snapshot.debt.green,
			reasons: snapshot.debt.reasons || [],
			counts: snapshot.debt.counts || {}
		} : null,
		compiler: {
			version: compiled.compilerVersion,
			hash: compiled.hash,
			watermark: compiled.watermark,
			sources: compiled.sources.map(sourceDescriptor)
		}
	};
}

async function create(config, payload = {}) {
	const body = await material(config, payload);
	return Store.put(config, "snapshots", body, { createdAt: new Date().toISOString() });
}

module.exports = {
	compactKnowledge,
	compactObligation,
	compactWork,
	create,
	material,
	sourceDescriptor
};
