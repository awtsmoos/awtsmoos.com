// B"H
// Boruch Hashem
// Blessed is He

import { createSubAgentElement as h } from "./dom.js";

/**
 * @file Mission cards and roster rendering for the Sub-agents constellation.
 * @description The Awtsmoos creates many messengers from one will; Awtsmoos.com renders each bounded identity as text, never trusting backend HTML to spill.
 */

function statusClass(mission) {
	return mission.active ? "is-active" : /complete|done|success/i.test(mission.status) ? "is-complete" : "is-quiet";
}

/** @description Renders selectable mission cards into one owned list node. @param {HTMLElement} listNode - Mission-list DOM vessel. @param {object[]} missions - Normalized missions. @param {string} selectedId - Selected mission id. @returns {void} @sideEffects Replaces children of listNode. */
export function renderSubAgentMissionCards(listNode, missions, selectedId) {
	if (!missions.length) {
		listNode.replaceChildren(h("div", { className: "awt-subagents__empty" }, h("strong", { text: "No website-agent missions are visible yet." }), h("p", { text: "Authenticate ChatGPT, describe a goal, and launch the first bounded team." })));
		return;
	}
	const cards = missions.map((mission) => h("button", {
		type: "button",
		className: `awt-subagents__mission-card ${statusClass(mission)} ${mission.id === selectedId ? "is-selected" : ""}`,
		"data-subagent-mission-id": mission.id,
		"aria-pressed": mission.id === selectedId ? "true" : "false"
	},
		h("span", { className: "awt-subagents__mission-status", text: mission.status }),
		h("strong", { className: "awt-subagents__mission-title", text: mission.goal || mission.id }),
		h("span", { className: "awt-subagents__mission-meta", text: `${mission.agentCount || mission.agents.length} agents · ${mission.backlog} queued` }),
		h("span", { className: "awt-subagents__mission-id", text: mission.id })
	));
	listNode.replaceChildren(...cards);
}

/** @description Renders one selected mission and its bounded roster. @param {HTMLElement} detailNode - Detail DOM vessel. @param {object|null} mission - Normalized selected mission. @returns {void} @sideEffects Replaces children of detailNode. */
export function renderSubAgentMissionDetail(detailNode, mission) {
	if (!mission) {
		detailNode.replaceChildren();
		return;
	}
	const roster = mission.agents.slice(0, 80).map((agent) => h("li", { className: "awt-subagents__agent-row" },
		h("span", { className: "awt-subagents__agent-depth", text: `D${agent.depth}` }),
		h("span", { className: "awt-subagents__agent-name", text: agent.name }),
		h("span", { className: "awt-subagents__agent-status", text: agent.status })
	));
	detailNode.replaceChildren(
		h("div", { className: "awt-subagents__detail-head" }, h("div", {}, h("span", { className: "awt-subagents__mission-status", text: mission.status }), h("h4", { text: mission.goal })), h("code", { text: mission.id })),
		h("div", { className: "awt-subagents__detail-metrics" }, h("span", { text: `${mission.agentCount || mission.agents.length} agents` }), h("span", { text: `${mission.backlog} queued` }), h("span", { text: mission.updatedAt || "No update timestamp" })),
		h("ul", { className: "awt-subagents__roster", "aria-label": "Sub-agent roster" }, ...roster)
	);
}
