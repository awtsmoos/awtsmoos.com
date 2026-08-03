// B"H
import { action } from "./action.js";

/** Mission and website-team actions turn receipts into durable memory. */
export const MISSION_ACTIONS = Object.freeze([
	action(
		"agent",
		"Start ChatGPT website team",
		"Start a paced multi-agent mission through the authenticated ChatGPT website session.",
		"Website agents",
		["chatgpt-website", "multi-agent", "mission"],
		{ needsWebsiteMissionPrompt: true, websiteMissionMode: true }
	),
	action(
		"websiteAgentMissionList",
		"List website missions",
		"List redacted website-agent mission status without exposing continuation keys.",
		"Website agents",
		["chatgpt-website", "status"],
		{}
	),
	action(
		"websiteAgentMissionStatus",
		"Website mission status",
		"Read authentication, roster, rounds, failures, and room routing for one website mission.",
		"Website agents",
		["chatgpt-website", "status"],
		{ needsWebsiteMissionId: true }
	),
	action(
		"websiteAgentMissionMessage",
		"Message website agents",
		"Commit a shared-room message and wake matching website agents for their next safe turn.",
		"Website agents",
		["chatgpt-website", "message"],
		{ needsWebsiteMissionId: true, needsWebsiteMissionMessage: true }
	),
	action(
		"websiteAgentMissionStop",
		"Stop website mission",
		"Request a safe stop without duplicating or interrupting an accepted website POST.",
		"Website agents",
		["chatgpt-website", "stop"],
		{ needsWebsiteMissionId: true }
	),
	action(
		"websiteAgentMissionForget",
		"Forget website mission",
		"Delete an idle website mission and its private continuation mappings.",
		"Website agents",
		["chatgpt-website", "delete"],
		{ needsWebsiteMissionId: true }
	),
	action(
		"chatgptWebsiteLogout",
		"Log out ChatGPT website",
		"Clear ChatGPT/OpenAI site data and local continuation state without reading credentials.",
		"Website agents",
		["chatgpt-website", "logout"],
		{}
	),
	action(
		"missionAwareUse",
		"Use active mission",
		"Bind ordinary actions to one Mission OS id.",
		"Mission",
		["mission", "receipt"],
		{ missionId: "" }
	),
	action(
		"missionAwareStatus",
		"Mission-aware status",
		"Show active Mission OS auto-receipt state.",
		"Mission",
		["mission", "status"],
		{}
	),
	action(
		"previewReceiptAttach",
		"Attach preview receipt",
		"Attach a live preview URL as Mission OS evidence.",
		"Mission",
		["receipt"],
		{ needsMissionId: true, nodeId: "", url: "" }
	),
	action(
		"missionStart",
		"Start mission",
		"Create a durable autonomous mission.",
		"Mission",
		["autopilot"],
		{ needsMissionGoal: true }
	),
	action(
		"missionAutopilot",
		"Run mission autopilot",
		"Advance several autonomous mission rounds with bounded receipts.",
		"Mission",
		["autopilot", "bounded"],
		{ needsMissionId: true, needsMissionAutopilot: true }
	),
	action(
		"missionBrainstorm",
		"Brainstorm mission",
		"Expand the active mission from the supplied answer or constraint.",
		"Mission",
		["brainstorm", "expansion"],
		{ needsMissionId: true, needsMissionAutopilot: true }
	),
	action(
		"missionCheckpoint",
		"Checkpoint mission",
		"Record a durable checkpoint note before more autonomous work.",
		"Mission",
		["checkpoint", "receipt"],
		{ needsMissionId: true, needsMissionNote: true }
	),
	action(
		"missionSelfMailDraft",
		"Draft mission mail",
		"Prepare a mission progress email with the latest evidence.",
		"Mission",
		["mail", "receipt"],
		{ needsMissionId: true, needsMissionMail: true }
	),
	action(
		"missionReport",
		"Mission report",
		"Load current mission status.",
		"Mission",
		["status"],
		{ needsMissionId: true }
	)
]);
