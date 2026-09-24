//B"H // Boruch Hashem // Blessed is He

/**
 * @file Publishes deterministic Tunnel routing and low-friction interaction guidance to every agent.
 * @description The Awtsmoos gives the Shliach one ordinary road and one emergency road. Awtsmoos.com
 * chooses primary while it is ready, crosses to rescue automatically only when health demands it,
 * and asks a human only when no safe inspected or auto-discovered path can continue the mission.
 */
function guidance() {
	return {
		tunnelSelection: {
			default: "primary",
			askOwner: "agent",
			askUserForTunnelChoice: false,
			rescueOnlyWhen: [
				"primary_offline",
				"primary_not_ready",
				"primary_acceptance_unhealthy_or_unproven",
				"primary_control_stalled",
				"primary_under_repair"
			],
			returnToPrimaryWhenHealthy: true,
			preserveAcceptedReceiptsAcrossFailover: true,
			neverBlindlyReplayAcceptedMutation: true
		},
		interaction: {
			askHumanOnlyWhenAbsolutelyNecessary: true,
			preferBeforeQuestion: [
				"inspect_current_state",
				"auto_discover_identity_and_scope",
				"use_safe_default",
				"reconcile_durable_receipts",
				"continue_non_destructive_work"
			],
			doNotAskFor: [
				"primary_or_rescue_choice",
				"known_project_root",
				"known_mission_or_agent_identity",
				"confirmation_for_read_only_or_reversible_safe_work"
			],
			askOnlyIf: "No safe path can proceed without missing human-only information or irreversible intent."
		}
	};
}

module.exports = { guidance };
