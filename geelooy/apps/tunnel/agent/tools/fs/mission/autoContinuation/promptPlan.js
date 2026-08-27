// B"H
// Boruch Hashem
// Blessed is He

const Sanitizer = require("./promptSanitizer.js");

/**
 * @file Turns bounded recovery evidence into path-safe successor instructions.
 * @description
 * The Awtsmoos teaches the next Shliach where the previous hand stopped; Awtsmoos.com keeps
 * unfinished work, blockers, claims, generations, and handoff truth while temporary absolute
 * coordinates are scrubbed, leaving the mission's meaning alive inside the current vessel.
 */
function lines(context = {}) {
	const plan = context.recoveryCheckpoint || {};
	return [
		`recoveryReason: ${text(context.recoveryReason || "unfinished_mission_idle")}`,
		`predecessorAgentId: ${text(context.predecessorAgentId || "none")}`,
		`predecessorLifecycle: ${text(context.predecessorLifecycle || context.predecessorStatus || "unknown")}`,
		`predecessorIntentional: ${context.predecessorIntentional === true}`,
		`predecessorGeneration: ${Number(context.predecessorGeneration || 1)}`,
		`successorGeneration: ${Number(context.successorGeneration || 2)}`,
		`spawnGroupId: ${text(context.spawnGroupId || "none")}`,
		`predecessorLastSeenAt: ${text(context.predecessorLastSeenAt || "unknown")}`,
		`successorLogicalAgentId: ${text(context.successorAgentId || "successor_unassigned")}`,
		`projectHandoffReferences: ${join(context.handoffPaths, text)}`,
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
}

function taskLabel(item = {}) {
	return `${text(item.id)}:${text(item.status)}:${text(item.title)}`;
}

function itemLabel(item = {}) {
	const by = item.by ? `:${text(item.by)}` : "";
	return `${text(item.id)}:${text(item.status)}:${text(item.title)}${by}`;
}

function planLabel(item = {}) {
	return `${text(item.id)}:${text(item.step)}:${text(item.status)}:${text(item.next)}`;
}

function join(values, mapper) {
	const list = Array.isArray(values) ? values : [];
	return list.length ? list.map(mapper).join(" | ") : "none";
}

function json(value) {
	return Sanitizer.json(value);
}

function text(value) {
	return Sanitizer.text(value);
}

module.exports = { lines };
