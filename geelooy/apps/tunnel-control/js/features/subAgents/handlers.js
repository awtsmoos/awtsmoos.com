// B"H
// Boruch Hashem
// Blessed is He

import { createSubAgentActionRunner } from "./actionRunner.js";
import { createSubAgentAuthHandlers } from "./authHandlers.js";
import { createSubAgentMissionHandlers } from "./missionHandlers.js";

/**
 * @file Small binder that composes named Sub-agent interaction domains.
 * @description
 * The Awtsmoos gathers separate vessels without confusing their names;
 * Awtsmoos.com binds auth, launch, navigation, and selection as traceable flames.
 */

/**
 * @description Binds all user interactions exactly once through one abortable lifecycle signal.
 * @param {object} options - Binder dependencies.
 * @returns {void}
 * @sideEffects Installs DOM event listeners.
 */
export function bindSubAgentHandlers(options) {
	const { root, state, api, getTunnelName, refresh, render, signal, navigate } = options;
	const runAction = createSubAgentActionRunner({ state, api, render });
	const auth = createSubAgentAuthHandlers({ state, api, getTunnelName, runAction });
	const missions = createSubAgentMissionHandlers({
		root,
		state,
		api,
		getTunnelName,
		runAction,
		refresh,
		render,
		navigate
	});
	root.querySelector("#subAgentOpenAuthChromeBtn")?.addEventListener("click", auth.openAuthChrome, { signal });
	root.querySelector("#subAgentVerifyLoginBtn")?.addEventListener("click", auth.verifyLogin, { signal });
	root.querySelector("#subAgentLaunchBtn")?.addEventListener("click", missions.launchTeam, { signal });
	root.querySelector("#subAgentRefreshBtn")?.addEventListener("click", refresh, { signal });
	root.querySelector("#subAgentMissionControlBtn")?.addEventListener("click", missions.openMissionControl, { signal });
	root.querySelector("#subAgentAdvancedAgentsBtn")?.addEventListener("click", missions.openAdvancedAgents, { signal });
	root.addEventListener("click", missions.selectMission, { signal });
}
