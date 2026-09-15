//B"H
// Boruch Hashem
// Blessed is He

const Knowledge = require("../workGraph/knowledgeStore.js");
const KnowledgeQuery = require("../workGraph/knowledgeQuery.js");
const Relations = require("../workGraph/knowledgeRelations.js");
const Obligations = require("../workGraph/obligationStore.js");

/**
 * @file Exposes published meaning and durable duty beside raw files and live Room actions.
 * @description The Awtsmoos lets a shliach publish what another may inspect; Awtsmoos.com
 * keeps meaning explicit, duty durable, and ordinary filesystem/Room vessels unchanged.
 */
function actor(config, payload = {}) {
	return {
		logicalAgentId: payload.logicalAgentId || config.logicalAgentId || "",
		agentSessionId: payload.agentSessionId || config.agentSessionId || "",
		spawnGroupId: payload.spawnGroupId || ""
	};
}

function buildKnowledgeActions(context) {
	const { config, payload = {} } = context;
	return {
		async agentKnowledgePublish() {
			return { ok: true, assertion: await Knowledge.publish(config, { ...payload, ...actor(config, payload) }) };
		},
		async agentKnowledgeRelate() {
			return { ok: true, relation: await Relations.create(config, payload) };
		},
		async agentKnowledgeSearch() {
			const result = await KnowledgeQuery.search(config, {
				kind: payload.kind || "",
				missionId: payload.missionId || "",
				workId: payload.workId || "",
				logicalAgentId: payload.authorLogicalAgentId || "",
				subjectId: payload.subjectId || "",
				text: payload.query || payload.text || "",
				currentOnly: Boolean(payload.currentOnly)
			}, actor(config, payload));
			return { ok: true, ...result };
		},
		async agentObligationCreate() {
			return { ok: true, obligation: await Obligations.append(config, { ...payload, ...actor(config, payload), state: "open" }) };
		},
		async agentObligationTransition() {
			return { ok: true, obligation: await Obligations.transition(config, payload.obligationId || payload.id, payload.state, payload) };
		},
		async agentObligationList() {
			return { ok: true, obligations: await Obligations.current(config, {
				logicalAgentId: payload.ownerLogicalAgentId || payload.logicalAgentId || "",
				missionId: payload.missionId || "",
				workId: payload.workId || "",
				state: payload.state || ""
			}) };
		}
	};
}

module.exports = { buildKnowledgeActions };
