// B"H
// Boruch Hashem
// Blessed is He

import { h, $ } from "../../ui/dom.js";
import { boardCounts, collectWork } from "./workBoardModel.js";

/**
 * @file Renders one read-only operating board for every unfinished mission witness Mission Control can see.
 * @description The Awtsmoos gathers live rooms, plans, and older missions without creating a second
 * authority. Awtsmoos.com lets the human filter testimony while canonical rooms still own action.
 */
export function renderWorkBoard(state, callbacks = {}) {
	const root = $("missionVisibilityBoard");
	if (!root) return;
	const items = collectWork(state);
	const counts = boardCounts(state);
	root.replaceChildren(
		header(counts, state),
		filterBar(counts, state, callbacks),
		statusLine(state),
		...(items.length ? items.map(item => card(item, callbacks)) : [empty(state)])
	);
}

function header(counts, state) {
	const suffix = state.legacyMissionLoading ? " · history loading" : "";
	return h("header", { className: "awt-room-visibility-head" }, [
		h("div", {}, [
			h("p", { className: "eyebrow", text: "ALL WORK IN FLIGHT" }),
			h("h3", { text: "Started and unfinished missions" })
		]),
		h("span", {
			className: "awt-room-chip",
			text: `${counts.total || 0} open · ${counts["active now"] || 0} active · ${counts["needs attention"] || 0} attention${suffix}`
		})
	]);
}

function filterBar(counts, state, callbacks) {
	return h("div", { className: "button-row" }, filters().map(filter => h("button", {
		className: state.workBoardFilter === filter.value ? "primary" : "",
		text: `${filter.label} ${filter.value === "all" ? counts.total || 0 : counts[filter.value] || 0}`,
		on: { click: () => {
			state.workBoardFilter = filter.value;
			renderWorkBoard(state, callbacks);
		} }
	})));
}

function statusLine(state) {
	if (state.legacyMissionLoading) return h("small", { text: "Loading older mission history in the background; live rooms remain available." });
	if (state.legacyMissionError) return h("small", { text: `Mission history unavailable for this refresh: ${state.legacyMissionError}` });
	return h("small", { text: "Live rooms, three-pass plans, and mission history are merged without changing mission authority." });
}

function card(item, callbacks) {
	const progress = item.planning || { completed: 0, required: 3 };
	return h("article", { className: `awt-room-visibility-card is-${slug(item.category)}` }, [
		h("div", { className: "awt-room-visibility-title" }, [
			h("strong", { text: item.title || item.missionId || "Mission" }),
			h("span", { className: "awt-room-chip", text: item.category })
	]),
		h("p", { text: item.description || "No mission description yet." }),
		h("small", { text: `Sources: ${item.sources.join(" + ") || "unknown"}` }),
		h("div", { className: "button-row" }, [
			h("span", { className: "awt-room-chip", text: item.status || "in-progress" }),
			item.planning ? h("span", { className: "awt-room-chip", text: `planning ${progress.completed || 0}/${progress.required || 3}` }) : null,
			item.updatedAt ? h("span", { className: "awt-room-chip", text: activityText(item) }) : null,
			item.stale ? h("span", { className: "awt-room-chip", text: "stale activity" }) : null,
			...item.agents.slice(0, 4).map(agent => h("span", { className: "awt-room-chip", text: agent })),
			item.agents.length > 4 ? h("span", { className: "awt-room-chip", text: `+${item.agents.length - 4} agents` }) : null,
			item.hasRoom && item.missionId
				? h("button", { className: "primary", text: "Open live room", on: { click: () => callbacks.join?.(item.missionId) } })
				: h("span", { className: "awt-room-chip", text: item.category === "orphaned" ? "no live owner" : "no live room" })
		])
	]);
}

function activityText(item) {
	if (item.ageMs === null) return "activity unknown";
	const minutes = Math.floor(item.ageMs / 60000);
	if (minutes < 1) return "active <1m ago";
	if (minutes < 60) return `active ${minutes}m ago`;
	const hours = Math.floor(minutes / 60);
	if (hours < 24) return `active ${hours}h ago`;
	return `active ${Math.floor(hours / 24)}d ago`;
}

function empty(state) {
	const filtered = state.workBoardFilter && state.workBoardFilter !== "all";
	return h("article", { className: "awt-room-empty" }, [
		h("strong", { text: filtered ? "No missions match this filter." : "No unfinished missions are visible." }),
		h("small", { text: "Live rooms and plans render first; older mission history enriches this board afterward." })
	]);
}

function filters() {
	return [
		["all", "All"], ["active now", "Active"], ["needs attention", "Attention"],
		["recovering", "Recovering"], ["in progress", "In progress"], ["orphaned", "Orphaned"]
	].map(([value, label]) => ({ value, label }));
}
function slug(value) { return String(value || "unknown").replace(/\s+/g, "-"); }
