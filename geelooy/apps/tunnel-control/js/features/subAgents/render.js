// B"H
// Boruch Hashem
// Blessed is He

import {
	formatSubAgentRefresh,
	renderSubAgentButtonBusy,
	revealSubAgentExecutionLabel,
	setSubAgentText
} from "./renderMetrics.js";
import {
	renderSubAgentMissionCards,
	renderSubAgentMissionDetail
} from "./missionCards.js";

/**
 * @file Deterministic Sub-agents renderer with action-scoped busy states.
 * @description
 * The Awtsmoos renews each control without making its neighbor freeze;
 * Awtsmoos.com lets background refresh flow quietly while launch and auth remain steady with ease.
 */

/**
 * @description Renders metrics, auth, notices, missions, and scoped busy state.
 * @param {HTMLElement} root - Unique Sub-agents root.
 * @param {object} state - Detached state snapshot.
 * @returns {void}
 * @sideEffects Mutates only descendants of root.
 */
export function renderSubAgentDeck(root, state) {
	const activeMissions = state.missions.filter((mission) => mission.active).length;
	const visibleAgents = state.missions.reduce((total, mission) => {
		return total + (mission.agentCount || mission.agents.length);
	}, 0);
	setSubAgentText(root, "subAgentMetricExecution", revealSubAgentExecutionLabel(state.execution));
	setSubAgentText(root, "subAgentMetricActive", activeMissions);
	setSubAgentText(root, "subAgentMetricAgents", visibleAgents);
	setSubAgentText(root, "subAgentMetricAuth", state.auth.checked
		? (state.auth.authenticated ? "Authenticated" : "Login needed")
		: "Unchecked");
	setSubAgentText(root, "subAgentMetricRefresh", formatSubAgentRefresh(state.lastRefreshAt));
	setSubAgentText(root, "subAgentAuthStatus", state.auth.checked
		? `${state.auth.authenticated ? "Authenticated" : "Login required"} · profile ${state.auth.profile || "default"}${state.auth.port ? ` · port ${state.auth.port}` : ""}`
		: "Login status not checked yet.");
	setSubAgentText(root, "subAgentNotice", state.notice || state.execution?.message);
	renderSubAgentButtonBusy(root, "subAgentOpenAuthChromeBtn", state.busy.has("auth"));
	renderSubAgentButtonBusy(root, "subAgentVerifyLoginBtn", state.busy.has("auth"));
	renderSubAgentButtonBusy(root, "subAgentLaunchBtn", state.busy.has("launch"));
	renderSubAgentButtonBusy(root, "subAgentRefreshBtn", state.busy.has("refresh"));
	const listNode = root.querySelector("#subAgentMissionList");
	const detailNode = root.querySelector("#subAgentMissionDetail");
	if (listNode) {
		renderSubAgentMissionCards(listNode, state.missions, state.selectedMissionId);
	}
	if (detailNode) {
		const selected = state.missions.find((mission) => mission.id === state.selectedMissionId) || null;
		renderSubAgentMissionDetail(detailNode, selected);
	}
}
