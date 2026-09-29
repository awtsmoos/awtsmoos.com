// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Merges room, planning, and legacy mission testimony into one display-only work ledger.
 * @description The Awtsmoos reveals one mission through many witnesses; Awtsmoos.com deduplicates
 * those witnesses without moving authority away from canonical rooms or the visibility registry.
 */
export function collectWork(state = {}) {
	const work = new Map();
	for (const row of state.missions || []) merge(work, roomItem(row));
	for (const record of state.visibilityMissions || []) merge(work, visibilityItem(record));
	for (const record of legacyRows(state.legacyMissionResult)) merge(work, legacyItem(record));
	return [...work.values()]
		.map(finalize)
		.filter(item => !item.terminal)
		.sort((left, right) => rank(left) - rank(right) || String(right.updatedAt).localeCompare(String(left.updatedAt)));
}

export function legacyRows(result) {
	if (Array.isArray(result)) return result;
	for (const value of [result?.missions, result?.items, result?.records, result?.data?.missions]) {
		if (Array.isArray(value)) return value;
	}
	return [];
}

function roomItem(row = {}) {
	const mission = row.mission || row;
	const room = row.collaboration || row.room || {};
	const id = text(mission.id || row.missionId || row.id);
	return base(id, {
		title: mission.goal || mission.title || id,
		description: mission.description || mission.progress || "Canonical live mission room.",
		status: room.status || mission.status || row.status || "active",
		agents: list(room.agents || mission.agents), updatedAt: stamp(mission, row),
		hasRoom: Boolean(id), sources: ["live room"]
	});
}

function visibilityItem(record = {}) {
	const missionId = text(record.missionId);
	const identity = missionId || `visibility:${text(record.id)}`;
	return base(identity, {
		missionId,
		title: record.title || record.id || identity,
		description: record.description || record.progress || "Tunnel-visible mission plan.",
		status: record.status || "active", agents: list(record.agents), updatedAt: stamp(record),
		planning: record.planningProgress || null, sources: ["three-pass plan"]
	});
}

function legacyItem(record = {}) {
	const mission = record.mission || record;
	const id = text(mission.id || record.missionId || record.id);
	const identity = id || `legacy:${text(record.name || record.title || "unknown")}`;
	return base(identity, {
		missionId: id,
		title: mission.goal || mission.title || record.title || identity,
		description: mission.description || mission.progress || record.progress || "Previously started mission.",
		status: mission.status || record.status || "in-progress",
		agents: list(record.agents || mission.agents), updatedAt: stamp(mission, record), sources: ["mission history"]
	});
}

function base(identity, patch) {
	return { identity, missionId: text(patch.missionId || identity), title: "", description: "", status: "", agents: [], updatedAt: "", planning: null, hasRoom: false, sources: [], ...patch };
}

function merge(map, incoming) {
	if (!incoming.identity) return;
	const current = map.get(incoming.identity);
	if (!current) return map.set(incoming.identity, incoming);
	map.set(incoming.identity, {
		...current,
		...prefer(incoming, current),
		hasRoom: current.hasRoom || incoming.hasRoom,
		agents: unique([...current.agents, ...incoming.agents]),
		sources: unique([...current.sources, ...incoming.sources]),
		planning: incoming.planning || current.planning
	});
}

function prefer(incoming, current) {
	return {
		missionId: incoming.missionId || current.missionId,
		title: current.hasRoom ? current.title : incoming.title || current.title,
		description: incoming.description || current.description,
		status: strongerStatus(current.status, incoming.status),
		updatedAt: String(incoming.updatedAt) > String(current.updatedAt) ? incoming.updatedAt : current.updatedAt
	};
}

function finalize(item) {
	const status = text(item.status).toLowerCase();
	const terminal = /\b(completed|complete|done|archived|cancelled|canceled)\b/.test(status);
	return { ...item, terminal, category: category(item, status) };
}
function category(item, status) {
	if (/recover|disconnect|offline/.test(status)) return "recovering";
	if (/blocked|failed|error|needs.?human|attention|waiting.?human/.test(status)) return "needs attention";
	if (item.hasRoom && (item.agents.length || /running|active/.test(status))) return "active now";
	if (!item.hasRoom && !item.agents.length && item.sources.includes("mission history")) return "orphaned";
	return "in progress";
}
function rank(item) { return ({ "needs attention": 0, recovering: 1, "active now": 2, "in progress": 3, orphaned: 4 })[item.category] ?? 5; }
function strongerStatus(left, right) { const textStatus = `${left} ${right}`; if (/blocked|failed|error|needs.?human/i.test(textStatus)) return right || left; return left || right; }
function stamp(...values) { for (const value of values) { const found = value?.updatedAt || value?.lastActivityAt || value?.createdAt; if (found) return String(found); } return ""; }
function list(value) { return Array.isArray(value) ? value.map(item => text(item?.agentId || item?.name || item)).filter(Boolean) : []; }
function unique(values) { return [...new Set(values.filter(Boolean))]; }
function text(value) { return String(value || "").trim(); }
