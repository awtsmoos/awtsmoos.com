// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Normalizes the three independent mission witnesses consumed by the all-work board.
 * @description The Awtsmoos reveals one deed through room, plan, history, and filed reports;
 * Awtsmoos.com keeps each witness recognizable while projecting one safe display identity.
 */
export function roomItem(row = {}) {
	const mission = row.mission || row;
	const room = row.collaboration || row.room || {};
	const id = text(mission.id || row.missionId || row.id);
	return base(id, {
		title: mission.goal || mission.title || id,
		description: mission.description || mission.progress || "Canonical live mission room.",
		status: room.status || mission.status || row.status || "active",
		agents: list(room.agents || mission.agents),
		updatedAt: stamp(mission, row),
		hasRoom: Boolean(id),
		sources: ["live room"]
	});
}

export function visibilityItem(record = {}) {
	const missionId = text(record.missionId);
	const identity = missionId || `visibility:${text(record.id)}`;
	return base(identity, {
		missionId,
		title: record.title || record.id || identity,
		description: record.description || record.progress || "Tunnel-visible mission plan.",
		status: record.status || "active",
		agents: list(record.agents),
		updatedAt: stamp(record),
		planning: record.planningProgress || null,
		reportSummary: record.reportSummary || null,
		sources: ["three-pass plan"]
	});
}

export function legacyItem(record = {}) {
	const mission = record.mission || record;
	const id = text(mission.id || record.missionId || record.id);
	const identity = id || `legacy:${text(record.name || record.title || "unknown")}`;
	return base(identity, {
		missionId: id,
		title: mission.goal || mission.title || record.title || identity,
		description: mission.description || mission.progress || record.progress || "Previously started mission.",
		status: mission.status || record.status || "in-progress",
		agents: list(record.agents || mission.agents),
		updatedAt: stamp(mission, record),
		reportSummary: mission.reportSummary || record.reportSummary || null,
		sources: ["mission history"]
	});
}

export function legacyRows(result) {
	if (Array.isArray(result)) return result;
	for (const value of [result?.missions, result?.items, result?.records, result?.data?.missions]) {
		if (Array.isArray(value)) return value;
	}
	return [];
}

function base(identity, patch) {
	return {
		identity,
		missionId: text(patch.missionId || identity),
		title: "",
		description: "",
		status: "",
		agents: [],
		updatedAt: "",
		planning: null,
		reportSummary: null,
		hasRoom: false,
		sources: [],
		...patch
	};
}
function stamp(...values) {
	for (const value of values) {
		const found = value?.updatedAt || value?.lastActivityAt || value?.createdAt;
		if (found) return String(found);
	}
	return "";
}
function list(value) {
	return Array.isArray(value)
		? value.map(item => text(item?.agentId || item?.name || item)).filter(Boolean)
		: [];
}
function text(value) {
	return String(value || "").trim();
}
