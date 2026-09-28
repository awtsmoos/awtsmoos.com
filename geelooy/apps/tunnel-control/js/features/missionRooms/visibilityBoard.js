// B"H
// Boruch Hashem
// Blessed is He

import { h, $ } from "../../ui/dom.js";

/**
 * @file Renders every active tunnel-visible mission beside canonical live rooms.
 * @description The Awtsmoos reveals planning truth without forging room membership. Awtsmoos.com
 * lets linked records open the canonical live room while unlinked work remains honestly visible.
 */
export function renderVisibilityBoard(state, callbacks = {}) {
	const root = $("missionVisibilityBoard");
	if (!root) return;
	const records = Array.isArray(state.visibilityMissions) ? state.visibilityMissions : [];
	root.replaceChildren(
		header(records),
		...(records.length ? records.map(record => card(record, callbacks)) : [empty()])
	);
}

function header(records) {
	const complete = records.filter(record => record.planningProgress?.complete).length;
	return h("header", { className: "awt-room-visibility-head" }, [
		h("div", {}, [
			h("p", { className: "eyebrow", text: "TUNNEL MISSION REGISTRY" }),
			h("h3", { text: "Active mission plans" })
		]),
		h("span", { className: "awt-room-chip", text: `${records.length} active · ${complete} planned 3/3` })
	]);
}

function card(record, callbacks) {
	const progress = record.planningProgress || { completed: 0, required: 3 };
	const latest = [...(record.planningPasses || [])].sort((a, b) => Number(b.pass) - Number(a.pass))[0];
	const linked = Boolean(record.missionId);
	return h("article", { className: `awt-room-visibility-card ${linked ? "is-linked" : "is-unlinked"}` }, [
		h("div", { className: "awt-room-visibility-title" }, [
			h("strong", { text: record.title || record.id || "Visible mission" }),
			h("span", { className: "awt-room-chip", text: `planning ${progress.completed || 0}/${progress.required || 3}` })
	]),
		h("p", { text: record.description || record.progress || "No mission description yet." }),
		latest ? h("small", { text: `Pass ${latest.pass}: ${latest.summary || latest.title || "submitted"}` }) : h("small", { text: "No planning pass submitted yet." }),
		h("div", { className: "button-row" }, [
			h("span", { className: "awt-room-chip", text: record.status || "active" }),
			linked
				? h("button", { className: "primary", text: "Open live room", on: { click: () => callbacks.join?.(record.missionId) } })
				: h("span", { className: "awt-room-chip", text: "awaiting live-room link" })
		])
	]);
}

function empty() {
	return h("article", { className: "awt-room-empty" }, [
		h("strong", { text: "No tunnel-visible missions yet." }),
		h("small", { text: "Agents should register work and submit planning passes 1, 2, and 3." })
	]);
}
