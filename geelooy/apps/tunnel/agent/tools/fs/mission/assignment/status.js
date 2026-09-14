//B"H
//Boruch Hashem
//Blessed be He

const Mission = require("../index.js");
const Recovery = require("../agentSessionRecovery.js");
const Work = require("../workRegistry.js");
const Briefing = require("./briefing.js");
const Claims = require("./claims.js");
const Paths = require("./paths.js");

/**
 * @file Projects global mission/session truth for realtime Tunnel Control views.
 * @description
 * The operator sees durable missions and disposable chats as separate layers: which root
 * each mission owns, what remains, what is still claimable, and who needs replacement.
 */
async function snapshot(config, input = {}) {
	const [missions, sessionStatus] = await Promise.all([
		Mission.all(config),
		Recovery.status(config, input)
	]);
	const sessionByMission = groupSessions(sessionStatus.sessions);
	const missionCards = missions.map(mission => card(
		config,
		mission,
		sessionByMission.get(mission.id) || []
	));
	return {
		ok: true,
		action: "missionDispatchStatus",
		updatedAt: new Date().toISOString(),
		missionCount: missionCards.length,
		openMissionCount: missionCards.filter(item => item.remainingCount > 0).length,
		sessions: sessionStatus,
		missions: missionCards,
		unassignedActiveSessions: sessionStatus.sessions.filter(session => {
			return !session.activeMissionId && ["active", "working", "waiting"].includes(session.status);
		})
	};
}

function card(config, mission, sessions) {
	const paths = Paths.absolutePaths(config, mission);
	const remaining = Work.open(mission);
	const available = Claims.available(mission, {});
	return {
		missionId: mission.id,
		goal: mission.goal || "",
		status: mission.status || "active",
		projectRoot: paths[0] || Paths.projectRoot(config, mission),
		absolutePaths: paths,
		remainingCount: remaining.length,
		availableCount: available.length,
		remainingWork: remaining.slice(0, 10),
		improvements: Briefing.improvements(mission).slice(0, 10),
		blockers: mission.blockers || [],
		agentSessions: sessions,
		updatedAt: mission.updatedAt || mission.createdAt || ""
	};
}

function groupSessions(sessions = []) {
	const grouped = new Map();
	for (const session of sessions) {
		if (!session.activeMissionId) continue;
		const current = grouped.get(session.activeMissionId) || [];
		current.push(session);
		grouped.set(session.activeMissionId, current);
	}
	return grouped;
}

module.exports = { card, groupSessions, snapshot };
