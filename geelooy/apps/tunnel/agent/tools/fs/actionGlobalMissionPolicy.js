//B"H
//Boruch Hashem
//Blessed be He

const GLOBAL_MISSION_ACTIONS = new Set([
	"missionAgentConnect",
	"missionAgentNextWork",
	"missionAgentHeartbeat",
	"missionAgentReport",
	"missionAgentSessionEnd",
	"missionAgentSessionExhausted",
	"missionAgentRecoveryCandidates",
	"missionAgentRecoverySweep",
	"missionAgentEnsurePool",
	"missionDispatchStatus",
	"missionDispatchReconcile"
]);

/**
 * @file Separates global dispatcher controls from one foreground mission transaction.
 * @description
 * These actions discover or coordinate durable missions themselves, so legacy implicit
 * mission boot/firewall wrapping would deadlock them before their own authority exists.
 */
function owns(action) {
	return GLOBAL_MISSION_ACTIONS.has(String(action || ""));
}

module.exports = { GLOBAL_MISSION_ACTIONS, owns };
