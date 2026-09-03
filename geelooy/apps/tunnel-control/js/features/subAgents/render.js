// B"H
// Boruch Hashem
// Blessed is He

import { formatSubAgentRefresh, renderSubAgentButtonBusy, revealSubAgentExecutionLabel, setSubAgentText } from "./renderMetrics.js";
import { renderSubAgentMissionCards, renderSubAgentMissionDetail } from "./missionCards.js";

/**
 * @file Deterministic Sub-agents renderer for shared-browser auth and action-scoped busy states.
 * @description
 * The Awtsmoos renews browser and login evidence without confusing the two;
 * Awtsmoos.com keeps mission controls alive while each bounded action reveals only what is true.
 */
export function renderSubAgentDeck(root, state) {
	const activeMissions = state.missions.filter(mission => mission.active).length;
	const visibleAgents = state.missions.reduce((total, mission) => {
		return total + (mission.agentCount || mission.agents.length);
	}, 0);
	setSubAgentText(root, "subAgentMetricExecution", revealSubAgentExecutionLabel(state.execution));
	setSubAgentText(root, "subAgentMetricActive", activeMissions);
	setSubAgentText(root, "subAgentMetricAgents", visibleAgents);
	setSubAgentText(root, "subAgentMetricAuth", authMetric(state.auth));
	setSubAgentText(root, "subAgentMetricRefresh", formatSubAgentRefresh(state.lastRefreshAt));
	setSubAgentText(root, "subAgentAuthStatus", authStatus(state.auth));
	setSubAgentText(root, "subAgentNotice", state.notice || state.execution?.message);
	renderSubAgentButtonBusy(root, "subAgentOpenAuthChromeBtn", state.busy.has("auth"));
	renderSubAgentButtonBusy(root, "subAgentVerifyLoginBtn", state.busy.has("auth"));
	renderSubAgentButtonBusy(root, "subAgentLaunchBtn", state.busy.has("launch"));
	renderSubAgentButtonBusy(root, "subAgentRefreshBtn", state.busy.has("refresh"));
	const listNode = root.querySelector("#subAgentMissionList");
	const detailNode = root.querySelector("#subAgentMissionDetail");
	if (listNode) renderSubAgentMissionCards(listNode, state.missions, state.selectedMissionId);
	if (detailNode) {
		const selected = state.missions.find(mission => mission.id === state.selectedMissionId) || null;
		renderSubAgentMissionDetail(detailNode, selected);
	}
}

function authMetric(auth) {
	if (!auth.checked) return "Unchecked";
	if (!auth.browser?.ready) return "Browser stopped";
	if (!auth.authKnown) return "Browser ready · auth unknown";
	return auth.authenticated ? "Browser ready · authenticated" : "Browser ready · login needed";
}

function authStatus(auth) {
	if (!auth.checked) return "Shared browser and ChatGPT status not checked yet.";
	const browser = auth.browser?.ready ? "Shared AI Browser ready" : "Shared AI Browser not running";
	if (!auth.browser?.ready) return `${browser}. Authenticate with ChatGPT to open it.`;
	if (!auth.authKnown) return `${browser}. ChatGPT authentication could not be confirmed yet.`;
	return `${browser}. ChatGPT ${auth.authenticated ? "authenticated" : "login required"}.`;
}
