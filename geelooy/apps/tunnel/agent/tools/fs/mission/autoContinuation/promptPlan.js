// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Turns a bounded recovery checkpoint into deterministic successor instructions.
 * @description The Awtsmoos teaches the next Shliach where the previous hand stopped;
 * Awtsmoos.com names completed work, unfinished work, blockers, handoff, and next action without flooding the prompt with raw mission history.
 */
function lines(context = {}) {
	const plan = context.recoveryCheckpoint || {};
	const output = [
		`recoveryReason: ${text(context.recoveryReason || "unfinished_mission_idle")}`,
		`predecessorAgentId: ${text(context.predecessorAgentId || "none")}`,
		`predecessorStatus: ${text(context.predecessorStatus || "unknown")}`,
		`predecessorLastSeenAt: ${text(context.predecessorLastSeenAt || "unknown")}`,
		`successorLogicalAgentId: ${text(context.successorAgentId || "successor_unassigned")}`,
		`missionGoal: ${text(plan.goal || "")}`,
		`missionStatus: ${text(plan.status || "unknown")}`,
		`missionPhase: ${text(plan.phase || "unknown")}`,
		`completion: ${Number(plan.completionPercent || 0)}%`,
		`latestCheckpoint: ${json(plan.latestCheckpoint)}`,
		`lastCompletedTask: ${json(plan.lastCompletedTask)}`,
		`requiredNextAction: ${json(plan.nextRequiredAction)}`,
		`unfinishedTasks: ${join(plan.unfinishedTasks, taskLabel)}`,
		`openJobs: ${join(plan.openJobs, itemLabel)}`,
		`blockers: ${join(plan.blockers, itemLabel)}`,
		`activeClaims: ${join(plan.activeClaims, itemLabel)}`,
		`openDelegations: ${join(plan.openDelegations, itemLabel)}`,
		`recentPlans: ${join(plan.recentPlans, planLabel)}`,
		`latestHandoff: ${json(plan.latestHandoff)}`
	];
	return output;
}

function taskLabel(item = {}) {
	return `${text(item.id)}:${text(item.status)}:${text(item.title)}`;
}

function itemLabel(item = {}) {
	return `${text(item.id)}:${text(item.status)}:${text(item.title)}${item.by ? `:${text(item.by)}` : ""}`;
}

function planLabel(item = {}) {
	return `${text(item.id)}:${text(item.step)}:${text(item.status)}:${text(item.next)}`;
}

function join(values, mapper) {
	const list = Array.isArray(values) ? values : [];
	return list.length ? list.map(mapper).join(" | ") : "none";
}

function json(value) {
	if (value == null) return "none";
	try {
		return JSON.stringify(value).slice(0, 1400);
	} catch {
		return text(value);
	}
}

function text(value) {
	return String(value || "").replace(/\s+/g, " ").trim().slice(0, 600);
}

module.exports = { lines };
