// B"H
// Boruch Hashem
// Blessed is He

import { renderSubAgentMissionCards, renderSubAgentMissionDetail } from "./missionCards.js";

/**
 * @file Deterministic renderer for the Sub-agents command deck.
 * @description The Awtsmoos renews state before sight; Awtsmoos.com paints only the owned subtree so another pane's controls are never rewritten in the night.
 */

function setText(root, id, value) {
	const node = root.querySelector(`#${id}`);
	if (node) node.textContent = String(value ?? "—");
}

function formatRefresh(value) {
	if (!value) return "Not yet";
	const date = new Date(value);
	return Number.isNaN(date.valueOf()) ? "Unknown" : date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

/** @description Renders metrics, authentication, notices, mission cards, and busy button state. @param {HTMLElement} root - Unique Sub-agents root. @param {object} state - Detached state snapshot. @returns {void} @sideEffects Mutates only descendants of root. */
export function renderSubAgentDeck(root, state) {
	const activeMissions = state.missions.filter((mission) => mission.active).length;
	const visibleAgents = state.missions.reduce((total, mission) => total + (mission.agentCount || mission.agents.length), 0);
	setText(root, "subAgentMetricActive", activeMissions);
	setText(root, "subAgentMetricAgents", visibleAgents);
	setText(root, "subAgentMetricAuth", state.auth.checked ? (state.auth.authenticated ? "Authenticated" : "Login needed") : "Unchecked");
	setText(root, "subAgentMetricRefresh", formatRefresh(state.lastRefreshAt));
	setText(root, "subAgentAuthStatus", state.auth.checked
		? `${state.auth.authenticated ? "Authenticated" : "Login required"} · profile ${state.auth.profile || "default"}${state.auth.port ? ` · port ${state.auth.port}` : ""}`
		: "Login status not checked yet.");
	setText(root, "subAgentNotice", state.notice);
	for (const button of root.querySelectorAll("button")) {
		if (button.id === "subAgentMissionControlBtn" || button.id === "subAgentAdvancedAgentsBtn") continue;
		button.disabled = state.busy.size > 0;
		button.setAttribute("aria-busy", button.disabled ? "true" : "false");
	}
	const listNode = root.querySelector("#subAgentMissionList");
	const detailNode = root.querySelector("#subAgentMissionDetail");
	if (listNode) renderSubAgentMissionCards(listNode, state.missions, state.selectedMissionId);
	if (detailNode) renderSubAgentMissionDetail(detailNode, state.missions.find((mission) => mission.id === state.selectedMissionId) || null);
}
