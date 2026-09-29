// B"H
// Boruch Hashem
// Blessed is He

import { h, $ } from "../../ui/dom.js";
import { collectWork } from "./workBoardModel.js";

/**
 * @file Renders one read-only board for every unfinished mission witness Mission Control can see.
 * @description The Awtsmoos gathers live rooms, plans, and older missions without creating a second
 * authority. Awtsmoos.com only opens canonical rooms; everything else remains honest observation.
 */
export function renderWorkBoard(state, callbacks = {}) {
	const root = $("missionVisibilityBoard");
	if (!root) return;
	const items = collectWork(state);
	root.replaceChildren(
		header(items, state),
		...(items.length ? items.map(item => card(item, callbacks)) : [empty()])
	);
}

function header(items, state) {
	const counts = items.reduce((all, item) => {
		all[item.category] = (all[item.category] || 0) + 1;
		return all;
	}, {});
	const legacy = state.legacyMissionLoading ? " · history loading" : "";
	return h("header", { className: "awt-room-visibility-head" }, [
		h("div", {}, [
			h("p", { className: "eyebrow", text: "ALL WORK IN FLIGHT" }),
			h("h3", { text: "Started and unfinished missions" })
		]),
		h("span", {
			className: "awt-room-chip",
			text: `${items.length} open · ${counts["active now"] || 0} active · ${counts["needs attention"] || 0} attention${legacy}`
		})
	]);
}

function card(item, callbacks) {
	const progress = item.planning || { completed: 0, required: 3 };
	const sourceText = item.sources.join(" + ");
	return h("article", { className: `awt-room-visibility-card is-${slug(item.category)}` }, [
		h("div", { className: "awt-room-visibility-title" }, [
			h("strong", { text: item.title || item.missionId || "Mission" }),
			h("span", { className: "awt-room-chip", text: item.category })
	]),
		h("p", { text: item.description || "No mission description yet." }),
		h("small", { text: `Sources: ${sourceText || "unknown"}` }),
		h("div", { className: "button-row" }, [
			h("span", { className: "awt-room-chip", text: item.status || "in-progress" }),
			item.planning ? h("span", { className: "awt-room-chip", text: `planning ${progress.completed || 0}/${progress.required || 3}` }) : null,
			h("span", { className: "awt-room-chip", text: `${item.agents.length} agents` }),
			item.hasRoom && item.missionId
				? h("button", { className: "primary", text: "Open live room", on: { click: () => callbacks.join?.(item.missionId) } })
				: h("span", { className: "awt-room-chip", text: item.category === "orphaned" ? "no live owner" : "no live room" })
		])
	]);
}

function empty() {
	return h("article", { className: "awt-room-empty" }, [
		h("strong", { text: "No unfinished missions are visible." }),
		h("small", { text: "Live rooms and three-pass plans render first; older mission history enriches this board afterward." })
	]);
}

function slug(value) {
	return String(value || "unknown").replace(/\s+/g, "-");
}
