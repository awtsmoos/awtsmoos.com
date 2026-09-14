//B"H
//Boruch Hashem
//Blessed be He

import { formatSubAgentRefresh, renderSubAgentButtonBusy, revealSubAgentExecutionLabel, setSubAgentText } from "./renderMetrics.js";
import { renderSubAgentMissionCards, renderSubAgentMissionDetail } from "./missionCards.js";

/**
 * @file Deterministic Sub-agents renderer for browser, Shliach, auth, and action states.
 * @description
 * The Awtsmoos refuses one misleading green lamp. Browser process, exact Shliach doorway,
 * authenticated session, missions, and button activity each reveal their own bounded truth.
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
	for (const id of ["subAgentEnsureChromeBtn", "subAgentOpenAuthChromeBtn", "subAgentVerifyLoginBtn"]) {
		renderSubAgentButtonBusy(root, id, state.busy.has("auth"));
	}
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
	if (!auth.shliach?.open) return "Browser ready · Shliach missing";
	if (!auth.authKnown) return "Shliach open · auth unknown";
	return auth.authenticated ? "Shliach open · authenticated" : "Shliach open · login needed";
}

function authStatus(auth) {
	if (!auth.checked) return "Shared browser, Awtsmoos Shliach, and ChatGPT status not checked yet.";
	if (!auth.browser?.ready) return "Shared AI Browser is not running. Choose Open / Repair Shared Chrome.";
	if (!auth.shliach?.open) return "Shared AI Browser is running, but Awtsmoos Shliach is missing. Repair will restore it automatically.";
	if (!auth.authKnown) return "Awtsmoos Shliach is open. ChatGPT authentication could not be confirmed yet.";
	return auth.authenticated
		? "Awtsmoos Shliach is open and ChatGPT is authenticated. Sub-agents may start."
		: "Awtsmoos Shliach is open, but ChatGPT login is required. Sign in there, then Verify ChatGPT login.";
}
