// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Mission launch, selection, and navigation handlers for Sub-agents.
 * @description
 * The Awtsmoos sends each messenger toward a bounded goal and way;
 * Awtsmoos.com validates before transport so a missing sentence never makes tunnel health decay.
 */

/**
 * @description Creates named mission and navigation handlers for one owned Sub-agents root.
 * @param {object} options - Mission-handler dependencies.
 * @returns {object} Named launch, selection, and navigation handlers.
 * @sideEffects Returned handlers may start missions, update UI state, or navigate after invocation.
 */
export function createSubAgentMissionHandlers(options) {
	const { root, state, api, getTunnelName, runAction, refresh, render, navigate } = options;

	/**
	 * @description Starts one already-validated bounded recursive website-agent team.
	 * @returns {Promise<void>} Resolves after launch and a follow-up evidence refresh.
	 * @throws {Error} When the tunnel rejects or cannot start the mission.
	 * @sideEffects Starts browser-backed agent work and performs a read-only refresh afterward.
	 */
	async function startValidatedTeam() {
		const goal = root.querySelector("#subAgentGoal")?.value?.trim() || "";
		const count = root.querySelector("#subAgentAgentCount")?.value || 4;
		await api.startSubAgentMission(getTunnelName(), goal, count);
		await refresh();
	}

	/**
	 * @description Validates the local goal before acquiring a transport lock, then launches the team.
	 * @returns {Promise<boolean>} Whether a valid launch completed successfully.
	 * @sideEffects May update notice text, render, and start a website-agent mission.
	 */
	async function launchTeam() {
		const goal = root.querySelector("#subAgentGoal")?.value?.trim() || "";
		if (!goal) {
			state.setNotice("Describe a mission goal before launching the team.");
			render();
			return false;
		}
		return runAction(
			"launch",
			startValidatedTeam,
			"Sub-agent team launch accepted by the tunnel."
		);
	}

	/** @description Opens Mission control through canonical shell navigation. @returns {boolean} Whether navigation occurred. @sideEffects May activate another pane. */
	function openMissionControl() {
		return navigate("missionRooms");
	}

	/** @description Opens the advanced AI Agents console through canonical shell navigation. @returns {boolean} Whether navigation occurred. @sideEffects May activate another pane. */
	function openAdvancedAgents() {
		return navigate("aiAgents");
	}

	/**
	 * @description Selects a delegated mission card from the owned Sub-agents root.
	 * @param {MouseEvent} event - Delegated click event.
	 * @returns {boolean} Whether a mission selection was applied.
	 * @sideEffects Updates selected mission state and renders the owned root.
	 */
	function selectMission(event) {
		const card = event.target?.closest?.("[data-subagent-mission-id]");
		if (!card) {
			return false;
		}
		state.selectMission(card.getAttribute("data-subagent-mission-id"));
		render();
		return true;
	}

	return {
		launchTeam,
		openMissionControl,
		openAdvancedAgents,
		selectMission
	};
}
