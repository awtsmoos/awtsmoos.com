//B"H
//Boruch Hashem
//Blessed be He

const Events = require("../workGraph/eventLedger.js");
const Knowledge = require("../workGraph/knowledgeQuery.js");
const Obligations = require("../workGraph/obligationStore.js");
const Source = require("./sourceModel.js");

/**
 * @file Adapts permanent graph truth into privacy-aware compiler sources.
 * @description The Awtsmoos reveals only published meaning, owned duty, and objective deeds;
 * Awtsmoos.com never turns hidden thought or private Room chatter into ambient context.
 */
function viewer(config, payload = {}) {
	return {
		logicalAgentId: String(payload.logicalAgentId || config.logicalAgentId || ""),
		spawnGroupId: String(payload.spawnGroupId || "")
	};
}

async function knowledgeSources(config, payload = {}) {
	const result = await Knowledge.search(config, {
		missionId: payload.missionId || "",
		workId: payload.workId || "",
		currentOnly: payload.currentKnowledgeOnly !== false
	}, viewer(config, payload));
	return result.assertions.map(item => Source.normalize({
		id: `knowledge:${item.id}`,
		type: "knowledge",
		text: `${item.kind}: ${item.statement}${item.summary ? `\n${item.summary}` : ""}`,
		sequence: item.sequence,
		version: String(item.sequence || item.id),
		metadata: {
			assertionId: item.id,
			kind: item.kind,
			missionId: item.missionId,
			workId: item.workId,
			superseded: Boolean(item.superseded)
		}
	}));
}

async function obligationSources(config, payload = {}) {
	const actor = viewer(config, payload).logicalAgentId;
	if (!actor) return [];
	const items = await Obligations.current(config, {
		logicalAgentId: actor,
		missionId: payload.missionId || "",
		workId: payload.workId || "",
		state: "open"
	});
	return items.map(item => Source.normalize({
		id: `obligation:${item.obligationId}`,
		type: "obligation",
		text: `${item.title}${item.body ? `\n${item.body}` : ""}`,
		sequence: item.sequence,
		version: String(item.sequence),
		metadata: {
			obligationId: item.obligationId,
			missionId: item.missionId,
			workId: item.workId,
			agentSessionId: item.agentSessionId
		}
	}));
}

function eventMission(event = {}) {
	return String(event.missionId || event.context?.missionId || "");
}

function eventWork(event = {}) {
	return String(event.workId || event.context?.workId || "");
}

function eventText(event = {}) {
	const facts = event.facts || {};
	const paths = [...(facts.before || []), ...(facts.after || [])]
		.map(item => item?.path)
		.filter(Boolean);
	return JSON.stringify({
		type: event.type,
		sequence: event.sequence,
		action: facts.action || "",
		requestId: event.requestId || "",
		paths: [...new Set(paths)]
	});
}

async function eventSources(config, payload = {}) {
	const maximum = Number(payload.maxEvents) > 0 ? Number(payload.maxEvents) : 40;
	return (await Events.list(config))
		.filter(event => !payload.missionId || eventMission(event) === payload.missionId)
		.filter(event => !payload.workId || eventWork(event) === payload.workId)
		.sort((left, right) => Number(right.sequence || 0) - Number(left.sequence || 0))
		.slice(0, maximum)
		.map(event => Source.normalize({
			id: `event:${event.id}`,
			type: "event",
			text: eventText(event),
			sequence: event.sequence,
			version: String(event.sequence),
			metadata: { eventId: event.id, eventType: event.type }
		}));
}

async function gather(config, payload = {}) {
	const groups = await Promise.all([
		knowledgeSources(config, payload),
		obligationSources(config, payload),
		eventSources(config, payload)
	]);
	return groups.flat();
}

module.exports = { eventSources, gather, knowledgeSources, obligationSources, viewer };
