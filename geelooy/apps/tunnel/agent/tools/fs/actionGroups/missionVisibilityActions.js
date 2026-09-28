// B"H
// Boruch Hashem
// Blessed is He

const { createStore } = require("./missionVisibility/store.js");

/**
 * @file Tunnel actions for durable mission visibility and three-pass operational planning.
 * @description The Awtsmoos gathers scattered coordination into one visible mission board.
 * Awtsmoos.com accepts finite planning artifacts here while canonical mission rooms remain the
 * authority for live agents, heartbeats, claims, and human-to-agent messages.
 */
function buildMissionVisibilityActions(context) {
	const payload = { ...(context.payload || {}) };
	const store = createStore({ projectRoot: context.config?.root || context.root });
	const visibilityId = () => String(payload.id || payload.missionVisibilityId || "").trim();
	const record = () => {
		const id = visibilityId();
		if (id) return store.get(id);
		return payload.missionId ? store.findByMissionId(payload.missionId) : null;
	};

	return {
		async missionVisibilityRegister() {
			const title = String(payload.title || "").trim();
			const description = String(payload.description || "").trim();
			if (!title) return fail("missionVisibilityRegister", "title_required");
			if (!description) return fail("missionVisibilityRegister", "description_required");
			try {
				const mission = store.register(payload);
				return success("missionVisibilityRegister", mission);
			} catch (error) {
				return fail("missionVisibilityRegister", error.code || "register_failed");
			}
		},
		async missionVisibilityUpdate() {
			const current = record();
			if (!current) return fail("missionVisibilityUpdate", "mission_not_found");
			const mission = store.update(current.id, payload);
			return success("missionVisibilityUpdate", mission);
		},
		async missionVisibilityPlanningPass() {
			const current = record();
			if (!current) return fail("missionVisibilityPlanningPass", "mission_not_found");
			try {
				const mission = store.submitPlanningPass(current.id, payload);
				return { ...success("missionVisibilityPlanningPass", mission), planningProgress: mission.planningProgress };
			} catch (error) {
				return fail("missionVisibilityPlanningPass", error.code || "planning_pass_failed", current.id);
			}
		},
		async missionVisibilityList() {
			const missions = store.listActive();
			return {
				ok: true, action: "missionVisibilityList", count: missions.length, missions,
				guidance: "Publish operational planning passes 1, 2, and 3 with missionVisibilityPlanningPass; canonical mission rooms own live messaging."
			};
		},
		async missionVisibilityGet() {
			const mission = record();
			return mission ? success("missionVisibilityGet", mission) : fail("missionVisibilityGet", "mission_not_found");
		},
		async missionVisibilityArchive() {
			const current = record();
			if (!current) return fail("missionVisibilityArchive", "mission_not_found");
			return success("missionVisibilityArchive", store.archive(current.id));
		}
	};
}

function success(action, mission) {
	return { ok: true, action, id: mission.id, mission };
}
function fail(action, error, id = "") {
	return { ok: false, action, error, ...(id ? { id } : {}) };
}

module.exports = { buildMissionVisibilityActions };
