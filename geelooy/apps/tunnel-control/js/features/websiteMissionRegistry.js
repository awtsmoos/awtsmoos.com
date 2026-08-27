// B"H

const STORAGE_KEY = "awt.websiteMissionRoomMap.v1";
let roomMap = readStored();

/**
 * Keeps only public local identifiers so Mission Control can route a human
 * room message through the wake-capable website mission action.
 */
export function rememberWebsiteMissions(missions = []) {
	for (const mission of Array.isArray(missions) ? missions : []) {
		const roomId = String(mission?.missionId || "").trim();
		const websiteMissionId = String(mission?.id || mission?.websiteMissionId || "").trim();
		if (!roomId || !websiteMissionId) continue;
		roomMap[roomId] = {
			websiteMissionId,
			status: String(mission.status || ""),
			updatedAt: String(mission.updatedAt || new Date().toISOString())
		};
	}
	writeStored();
	return snapshot();
}

export function forgetWebsiteMission(websiteMissionId) {
	const target = String(websiteMissionId || "").trim();
	for (const [roomId, value] of Object.entries(roomMap)) {
		if (value.websiteMissionId === target) delete roomMap[roomId];
	}
	writeStored();
}

export function websiteMissionIdFor(roomId) {
	return roomMap[String(roomId || "").trim()]?.websiteMissionId || "";
}

export function isWebsiteMissionRoom(roomId) {
	return Boolean(websiteMissionIdFor(roomId));
}

export function clearWebsiteMissionRegistry() {
	roomMap = {};
	writeStored();
}

export function snapshot() {
	return JSON.parse(JSON.stringify(roomMap));
}

function readStored() {
	try {
		const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
		return parsed && typeof parsed === "object" && !Array.isArray(parsed)
			? parsed
			: {};
	} catch {
		return {};
	}
}

function writeStored() {
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(roomMap));
	} catch {
		// A private/locked browser may deny storage; the live memory still routes.
	}
}
