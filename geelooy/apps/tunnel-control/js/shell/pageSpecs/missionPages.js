//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Mission-facing shell pages: rooms, live plans, and visible sub-agent continuation.
 * @description The Awtsmoos renews one mission through conversation, planning, and successor agents;
 * Awtsmoos.com gives each truth a distinct pane without dividing their durable authority.
 */
export const missionRoomsPage = {
	key: "missionRooms", group: "ai", badges: ["core", "rooms"], icon: "agents", emoji: "💬",
	title: "Mission control",
	desc: "Room OS lobby, conversation workspace, selected-room event stream, metrics, agents, files, and artifacts.",
	ids: [
		"roomLobby", "roomSearch", "roomFilter", "discoverRoomsBtn", "roomStatus", "roomList",
		"roomWorkspace", "newRoomGoal", "createRoomBtn", "roomOut"
	]
};

export const plansPage = {
	key: "plans", group: "ai", badges: ["core", "plans", "new"], icon: "agents", emoji: "🧭",
	title: "Plans",
	desc: "Live Tunnel-native plans with phases, checklists, remaining work, HTML detail, progress, and human steering prompts.",
	ids: [
		"planStatusFilter", "planRefreshBtn", "planStatus", "planList", "planProgress",
		"planChecklistControls", "planHtml", "planPromptInput", "planPromptBtn"
	]
};

export const subAgentsPage = {
	key: "subAgents", group: "ai", badges: ["core", "website", "new"], icon: "agents", emoji: "✨",
	title: "Sub-agents",
	desc: "Authenticate ChatGPT in persistent debug Chrome, launch bounded teams, and watch live mission rosters.",
	ids: ["subAgentCommandDeck"]
};
