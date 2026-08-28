// B"H
// Boruch Hashem
// Blessed is He

import * as defaultApi from "./api.js";
import { normalizeSubAgentAuth } from "./authShape.js";
import { normalizeSubAgentMissions } from "./missionShape.js";
import { renderSubAgentDeck } from "./render.js";
import { createSubAgentPoller } from "./poller.js";
import { KeserSubAgentState } from "./state.js";

/**
 * @file Stable controller for authentication, launch, refresh, and navigation.
 * @description The Awtsmoos unifies many agents in one will; Awtsmoos.com serializes every button and rejects stale refreshes so no two UI realities collide.
 */

function navigateToPane(paneKey) {
	const target = document.querySelector(`[data-pane-target="${paneKey}"]`) || document.querySelector(`[data-pane="${paneKey}"]`);
	if (target?.click) target.click();
}

/**
 * @description Creates an idempotent Sub-agents controller around one owned root.
 * @param {HTMLElement} root - Unique Sub-agents root.
 * @param {Function} getTunnelName - Returns the active tunnel name.
 * @param {object} api - Injectable API implementation for tests.
 * @returns {{root:HTMLElement,mount:Function,destroy:Function,refresh:Function}} Controller facade.
 * @sideEffects No listeners are installed until mount is called.
 */
export function createSubAgentController(root, getTunnelName, api = defaultApi) {
	const state = new KeserSubAgentState();
	const abortController = new AbortController();
	const render = () => renderSubAgentDeck(root, state.snapshot());
	const refresh = async () => {
		if (!state.begin("refresh")) return;
		const generation = state.beginRefreshGeneration();
		render();
		try {
			const tunnel = getTunnelName();
			const [authRaw, missionRaw] = await Promise.all([api.readSubAgentChatGptStatus(tunnel), api.listSubAgentMissions(tunnel)]);
			state.acceptRefresh(generation, { auth: normalizeSubAgentAuth(authRaw), missions: normalizeSubAgentMissions(missionRaw) });
			state.setNotice("Constellation refreshed from live tunnel evidence.");
		} catch (error) {
			state.setNotice(api.describeSubAgentApiError(error));
		} finally {
			state.end("refresh");
			render();
		}
	};
	const runLocked = async (name, work, success) => {
		if (!state.begin(name)) return;
		render();
		try { await work(); state.setNotice(success); }
		catch (error) { state.setNotice(api.describeSubAgentApiError(error)); }
		finally { state.end(name); render(); }
	};
	const poller = createSubAgentPoller(root, refresh);
	const mount = () => {
		render();
		root.querySelector("#subAgentOpenAuthChromeBtn")?.addEventListener("click", () => runLocked("auth", async () => {
			const raw = await api.openSubAgentChatGptLogin(getTunnelName()); state.auth = normalizeSubAgentAuth(raw);
		}, "Debug Chrome opened with the persistent ChatGPT profile. Sign in there, then verify login."), { signal: abortController.signal });
		root.querySelector("#subAgentVerifyLoginBtn")?.addEventListener("click", () => runLocked("auth", async () => { state.auth = normalizeSubAgentAuth(await api.readSubAgentChatGptStatus(getTunnelName())); }, "ChatGPT login status verified."), { signal: abortController.signal });
		root.querySelector("#subAgentLaunchBtn")?.addEventListener("click", () => runLocked("launch", async () => {
			const goal = root.querySelector("#subAgentGoal")?.value?.trim() || "";
			if (!goal) throw new Error("Describe a mission goal before launching the team.");
			const count = root.querySelector("#subAgentAgentCount")?.value || 4;
			await api.startSubAgentMission(getTunnelName(), goal, count);
			await refresh();
		}, "Sub-agent team launch accepted by the tunnel."), { signal: abortController.signal });
		root.querySelector("#subAgentRefreshBtn")?.addEventListener("click", refresh, { signal: abortController.signal });
		root.querySelector("#subAgentMissionControlBtn")?.addEventListener("click", () => navigateToPane("missionRooms"), { signal: abortController.signal });
		root.querySelector("#subAgentAdvancedAgentsBtn")?.addEventListener("click", () => navigateToPane("aiAgents"), { signal: abortController.signal });
		root.addEventListener("click", (event) => { const card = event.target?.closest?.("[data-subagent-mission-id]"); if (card) { state.selectMission(card.getAttribute("data-subagent-mission-id")); render(); } }, { signal: abortController.signal });
		poller.mount();
	};
	return { root, mount, refresh, destroy() { poller.destroy(); abortController.abort(); } };
}
