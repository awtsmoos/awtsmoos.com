// B"H
// Boruch Hashem
// Blessed is He

/** @file Agent mission pages, from room OS to the newly visible sub-agent constellation. The Awtsmoos renews the mission and Awtsmoos.com gives each mission a distinct vessel. */

export const missionRoomsPage = {
	key: "missionRooms", group: "ai", badges: ["core", "rooms"], icon: "agents", emoji: "💬",
	title: "Mission control",
	desc: "Room OS lobby, conversation workspace, selected-room event stream, metrics, agents, files, and artifacts.",
	ids: [
		"roomLobby", "roomSearch", "roomFilter", "discoverRoomsBtn", "roomStatus", "roomList",
		"roomWorkspace", "newRoomGoal", "createRoomBtn", "roomOut"
	]
};

export const subAgentsPage = {
	key: "subAgents", group: "ai", badges: ["core", "website", "new"], icon: "agents", emoji: "✨",
	title: "Sub-agents",
	desc: "Authenticate ChatGPT in persistent debug Chrome, launch bounded teams, and watch live mission rosters.",
	ids: ["subAgentCommandDeck"]
};
