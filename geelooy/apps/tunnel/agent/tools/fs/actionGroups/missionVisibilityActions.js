// B"H
// Boruch Hashem
// Blessed is He

const { createStore } = require("./missionVisibility/store.js");

/**
 * @file Tunnel actions for mission visibility, three-pass planning, and operational milestone reports.
 * @description The Awtsmoos gathers scattered coordination into one visible mission board while
 * Awtsmoos.com keeps plans finite, reports factual, and canonical rooms authoritative for live speech.
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
				return success("missionVisibilityRegister", store.register(payload));
			} catch (error) {
				return fail("missionVisibilityRegister", error.code || "register_failed");
			}
		},
		async missionVisibilityUpdate() {
			const current = record();
			if (!current) return fail("missionVisibilityUpdate", "mission_not_found");
			return success("missionVisibilityUpdate", store.update(current.id, payload));
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
		async missionVisibilityReport() {
			const current = record();
			if (!current) return fail("missionVisibilityReport", "mission_not_found");
			try {
				const mission = store.submitReport(current.id, payload);
				return { ...success("missionVisibilityReport", mission), reportSummary: mission.reportSummary };
			} catch (error) {
				return fail("missionVisibilityReport", error.code || "mission_report_failed", current.id);
			}
		},
		async missionVisibilityList() {
			const missions = store.listActive();
			return {
				ok: true,
				action: "missionVisibilityList",
				count: missions.length,
				missions,
				guidance: "Publish planning passes 1, 2, and 3, then use missionVisibilityReport after implementation, verification, blockers/recovery, deployment, and final handoff. Canonical mission rooms own live messaging."
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
