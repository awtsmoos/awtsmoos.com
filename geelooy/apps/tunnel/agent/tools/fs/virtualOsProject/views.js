//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Shapes one authoritative Project snapshot into navigable Virtual OS views.
 * @description The Awtsmoos keeps raw truth in its own vessels; Awtsmoos.com offers folders of
 * meaning that are only projections, so navigation never becomes a competing source of truth.
 */
function overview(snapshot = {}) {
	return {
		project: snapshot.project,
		mission: compactMission(snapshot.mission),
		counts: {
			work: snapshot.work?.length || 0,
			agents: snapshot.agents?.length || 0,
			knowledge: snapshot.knowledge?.length || 0,
			decisions: byKind(snapshot, "decision").length,
			failures: byKind(snapshot, "failure").length,
			obligations: snapshot.obligations?.length || 0,
			continuations: snapshot.continuations?.length || 0
		},
		debt: snapshot.debt
	};
}

function compactMission(mission = null) {
	if (!mission) return null;
	return {
		id: mission.id,
		goal: mission.goal || mission.title || "",
		status: mission.status || "",
		updatedAt: mission.updatedAt || ""
	};
}

function byKind(snapshot = {}, kind = "") {
	return (snapshot.knowledge || []).filter(item => String(item.kind || "") === kind);
}

function smart(snapshot = {}, name = "unfinished") {
	const view = String(name || "unfinished").toLowerCase();
	if (view === "failures" || view === "failed") return byKind(snapshot, "failure");
	if (view === "decisions") return byKind(snapshot, "decision");
	if (view === "obligations" || view === "blocked") return snapshot.obligations || [];
	if (view === "agents") return snapshot.agents || [];
	if (view === "continuations") return snapshot.continuations || [];
	if (view === "needs_verification") {
		return {
			green: snapshot.debt?.green === true,
			reasons: snapshot.debt?.reasons || [],
			issues: snapshot.debt?.finalization?.issues || []
		};
	}
	if (view === "stale_continuations") {
		return (snapshot.continuations || []).filter(record => {
			return record.status === "failed" || record.lastError;
		});
	}
	return snapshot.work || [];
}

module.exports = { byKind, compactMission, overview, smart };
