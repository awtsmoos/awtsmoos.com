// B"H
// Boruch Hashem
// Blessed is He

import { createSubAgentElement as h } from "./dom.js";

/**
 * @file Mission cards and roster rendering for the Sub-agents constellation.
 * @description
 * The Awtsmoos creates many messengers from one will without end;
 * Awtsmoos.com renders bounded text-only identities so backend HTML can never bend the frontend.
 */

/**
 * @description Maps normalized mission state to a namespaced visual-state class.
 * @param {object} mission - Normalized mission record.
 * @returns {string} Stable mission status class.
 * @sideEffects None.
 */
function revealMissionStatusClass(mission) {
	if (mission.active) {
		return "is-active";
	}
	if (/complete|done|success/i.test(mission.status)) {
		return "is-complete";
	}
	return "is-quiet";
}

/**
 * @description Renders selectable mission cards into one owned list node.
 * @param {HTMLElement} listNode - Mission-list DOM vessel.
 * @param {object[]} missions - Normalized mission collection.
 * @param {string} selectedId - Selected mission identity.
 * @returns {void}
 * @sideEffects Replaces children of the owned list node only.
 */
export function renderSubAgentMissionCards(listNode, missions, selectedId) {
	if (!missions.length) {
		const title = h("strong", { text: "No website-agent missions are visible yet." });
		const hint = h("p", { text: "Authenticate ChatGPT, describe a goal, and launch the first bounded team." });
		listNode.replaceChildren(h("div", { className: "awt-subagents__empty" }, title, hint));
		return;
	}
	const cards = missions.map((mission) => h("button", {
		type: "button",
		className: `awt-subagents__mission-card ${revealMissionStatusClass(mission)} ${mission.id === selectedId ? "is-selected" : ""}`,
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

/**
 * @description Renders one selected mission and a bounded agent roster.
 * @param {HTMLElement} detailNode - Mission-detail DOM vessel.
 * @param {object|null} mission - Normalized selected mission or null.
 * @returns {void}
 * @sideEffects Replaces children of the owned detail node only.
 */
export function renderSubAgentMissionDetail(detailNode, mission) {
	if (!mission) {
		detailNode.replaceChildren();
		return;
	}
	const roster = mission.agents.slice(0, 80).map((agent) => h("li", {
		className: "awt-subagents__agent-row"
	},
		h("span", { className: "awt-subagents__agent-depth", text: `D${agent.depth}` }),
		h("span", { className: "awt-subagents__agent-name", text: agent.name }),
		h("span", { className: "awt-subagents__agent-status", text: agent.status })
	));
	const heading = h("div", { className: "awt-subagents__detail-head" },
		h("div", {}, h("span", { className: "awt-subagents__mission-status", text: mission.status }), h("h4", { text: mission.goal })),
		h("code", { text: mission.id })
	);
	const metrics = h("div", { className: "awt-subagents__detail-metrics" },
		h("span", { text: `${mission.agentCount || mission.agents.length} agents` }),
		h("span", { text: `${mission.backlog} queued` }),
		h("span", { text: mission.updatedAt || "No update timestamp" })
	);
	detailNode.replaceChildren(heading, metrics, h("ul", { className: "awt-subagents__roster", "aria-label": "Sub-agent roster" }, ...roster));
}
