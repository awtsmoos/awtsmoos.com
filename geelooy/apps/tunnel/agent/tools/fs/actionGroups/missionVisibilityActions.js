// B"H // Boruch Hashem // Blessed is He

const { createStore } = require("./missionVisibility/store.js");

/**
 * @file Tunnel actions for the mission visibility registry.
 * @description Agents register their work here instead of scattering
 * .ai-thoughts folders. missionVisibilityList returns ALL active missions
 * with full detailed descriptions: one call, instant situational awareness.
 */
function buildMissionVisibilityActions(context) {
	const payload = { ...(context.payload || {}) };
	const store = createStore();
	const id = () => String(payload.id || payload.missionId || payload.missionVisibilityId || "").trim();
	return {
		async missionVisibilityRegister() {
			const title = String(payload.title || "").trim();
			const description = String(payload.description || "").trim();
			if (!title) return { ok: false, action: "missionVisibilityRegister", error: "title_required" };
			if (!description) return { ok: false, action: "missionVisibilityRegister", error: "description_required" };
			try {
				const mission = store.register(payload);
				return { ok: true, action: "missionVisibilityRegister", id: mission.id, mission };
			} catch (error) {
				return { ok: false, action: "missionVisibilityRegister", error: error.code || "register_failed" };
			}
		},
		async missionVisibilityUpdate() {
			const mission = store.update(id(), payload);
			if (!mission) return { ok: false, action: "missionVisibilityUpdate", error: "mission_not_found", id: id() };
			return { ok: true, action: "missionVisibilityUpdate", id: mission.id, mission };
		},
		async missionVisibilityList() {
			const missions = store.listActive();
			return { ok: true, action: "missionVisibilityList", count: missions.length, missions,
				guidance: "Each mission carries its full detailed description. Register new work with missionVisibilityRegister; update progress with missionVisibilityUpdate." };
		},
		async missionVisibilityGet() {
			const mission = store.get(id());
			if (!mission) return { ok: false, action: "missionVisibilityGet", error: "mission_not_found", id: id() };
			return { ok: true, action: "missionVisibilityGet", id: mission.id, mission };
		},
		async missionVisibilityArchive() {
			const mission = store.archive(id());
			if (!mission) return { ok: false, action: "missionVisibilityArchive", error: "mission_not_found", id: id() };
			return { ok: true, action: "missionVisibilityArchive", id: mission.id, mission };
		}
	};
}

module.exports = { buildMissionVisibilityActions };
