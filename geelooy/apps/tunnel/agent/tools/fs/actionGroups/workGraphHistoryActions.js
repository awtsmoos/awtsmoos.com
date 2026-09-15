//B"H
// Boruch Hashem
// Blessed is He

const Query = require("../workGraph/query.js");

/**
 * @file Exposes Chronicle navigation without replacing ordinary filesystem actions.
 * @description The Awtsmoos gives history as a lens beside the file itself; Awtsmoos.com
 * lets an agent ask what happened, while read/list/RAG still open the living project.
 */
function options(payload = {}) {
	return {
		missionId: payload.missionId || "",
		workId: payload.workId || "",
		type: payload.type || payload.eventType || "",
		subject: payload.subject || payload.subjectId || "",
		logicalAgentId: payload.logicalAgentId || "",
		agentSessionId: payload.agentSessionId || "",
		text: payload.query || payload.text || "",
		afterSequence: payload.afterSequence || 0,
		beforeSequence: payload.beforeSequence || 0,
		limit: payload.limit || 50,
		order: payload.order || "desc"
	};
}

function buildWorkGraphHistoryActions(context) {
	const { config, payload = {} } = context;
	return {
		async agentHistorySearch() {
			const result = await Query.search(config, options(payload));
			return { ok: true, action: payload.action, ...result };
		},
		async agentFileHistory() {
			const filePath = payload.path || payload.p || payload.file || "";
			const result = await Query.fileHistory(config, filePath, options(payload));
			return { ok: true, action: payload.action, ...result };
		},
		async agentWorkHistory() {
			const result = await Query.workHistory(
				config,
				payload.missionId || "",
				payload.workId || payload.id || "",
				options(payload)
			);
			return { ok: true, action: payload.action, ...result };
		}
	};
}

module.exports = { buildWorkGraphHistoryActions, options };
