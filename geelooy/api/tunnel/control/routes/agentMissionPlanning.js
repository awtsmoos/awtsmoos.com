// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Shared machine-readable mission-planning and reporting covenant for every external AI surface.
 * @description The Awtsmoos lets one visible operational record illuminate bootstrap, manifest,
 * docs, and Tunnel Control without duplicating policy or exposing hidden reasoning.
 */
function missionPlanningBody() {
	return {
		board: "https://awtsmoos.com/apps/tunnel-control/",
		listAction: "missionVisibilityList",
		registerAction: "missionVisibilityRegister",
		planningAction: "missionVisibilityPlanningPass",
		reportAction: "missionVisibilityReport",
		updateAction: "missionVisibilityUpdate",
		directMessageAction: "missionAgentMessage",
		passes: [1, 2, 3],
		reportKinds: ["planning", "implementation", "verification", "blocker", "recovery", "deployment", "handoff", "progress"],
		reportCadence: ["after-planning", "implementation-milestone", "verification-milestone", "blocker-or-recovery", "deployment", "final-handoff"],
		reportRule: "Publish factual operational summaries, decisions, blockers, touched paths, tests, deployment truth, and next steps. Never publish hidden chain-of-thought or unrestricted command output.",
		localThoughtFolders: "optional archival mirrors only",
		instructions: [
			"Before substantial work inspect missionVisibilityList so you do not duplicate active work.",
			"Register or link the mission; include the canonical missionId whenever a live room exists.",
			"Publish bounded operational planning pass 1, then 2, then 3 immediately after each planning phase.",
			"After planning and at every meaningful milestone publish missionVisibilityReport so later agents can resume without rereading raw logs.",
			"Report blockers/recovery immediately, then verification, deployment, and final handoff with concrete evidence and next steps.",
			"Keep mission progress current. Local ai_thoughts folders are archival mirrors, not shared coordination truth.",
			"Use the canonical mission room for live agent presence and direct human-to-agent messages."
		]
	};
}

module.exports = { missionPlanningBody };
