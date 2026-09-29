// B"H
// Boruch Hashem
// Blessed is He

import { legacyItem, legacyRows, roomItem, visibilityItem } from "./workBoardSources.js";

/**
 * @file Deduplicates and classifies all unfinished mission testimony for Mission Control.
 * @description The Awtsmoos gathers many witnesses into one visible mission without creating a
 * rival authority. Awtsmoos.com keeps action bound to canonical rooms and uses this only for view truth.
 */
export function collectWork(state = {}, now = Date.now()) {
	const work = new Map();
	for (const row of state.missions || []) merge(work, roomItem(row));
	for (const record of state.visibilityMissions || []) merge(work, visibilityItem(record));
	for (const record of legacyRows(state.legacyMissionResult)) merge(work, legacyItem(record));
	return [...work.values()]
		.map(item => finalize(item, now))
		.filter(item => !item.terminal)
		.filter(item => matchesFilter(item, state.workBoardFilter || "all"))
		.sort((left, right) => rank(left) - rank(right) || right.updatedMs - left.updatedMs);
}

export function boardCounts(state = {}, now = Date.now()) {
	const all = collectWork({ ...state, workBoardFilter: "all" }, now);
	return all.reduce((counts, item) => {
		counts.total += 1;
		counts[item.category] = (counts[item.category] || 0) + 1;
		return counts;
	}, { total: 0 });
}

export { legacyRows } from "./workBoardSources.js";

function merge(map, incoming) {
	if (!incoming.identity) return;
	const current = map.get(incoming.identity);
	if (!current) {
		map.set(incoming.identity, incoming);
		return;
	}
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
		updatedAt: newerStamp(current.updatedAt, incoming.updatedAt)
	};
}

function finalize(item, now) {
	const status = text(item.status).toLowerCase();
	const updatedMs = Date.parse(item.updatedAt || "") || 0;
	const ageMs = updatedMs ? Math.max(0, now - updatedMs) : null;
	const terminal = /\b(completed|complete|done|archived|cancelled|canceled)\b/.test(status);
	const stale = ageMs !== null && ageMs > 30 * 60 * 1000;
	return {
		...item,
		terminal,
		stale,
		ageMs,
		updatedMs,
		category: category(item, status, stale)
	};
}

function category(item, status, stale) {
	if (/recover|disconnect|offline/.test(status)) return "recovering";
	if (/blocked|failed|error|needs.?human|attention|waiting.?human/.test(status)) return "needs attention";
	if (item.hasRoom && (item.agents.length || /running|active/.test(status))) return "active now";
	if (!item.hasRoom && !item.agents.length && item.sources.includes("mission history")) return "orphaned";
	if (stale && !item.agents.length) return "orphaned";
	return "in progress";
}

function matchesFilter(item, filter) {
	return filter === "all" || item.category === filter;
}
function rank(item) {
	return ({ "needs attention": 0, recovering: 1, "active now": 2, "in progress": 3, orphaned: 4 })[item.category] ?? 5;
}
function strongerStatus(left, right) {
	const value = `${left} ${right}`;
	return /blocked|failed|error|needs.?human/i.test(value) ? right || left : left || right;
}
function newerStamp(left, right) {
	return (Date.parse(right || "") || 0) > (Date.parse(left || "") || 0) ? right : left;
}
function unique(values) {
	return [...new Set(values.filter(Boolean))];
}
function text(value) {
	return String(value || "").trim();
}
