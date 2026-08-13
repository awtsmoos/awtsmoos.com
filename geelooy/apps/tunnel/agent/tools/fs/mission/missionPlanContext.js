// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Projects one unfinished mission into a bounded checkpoint shared by successor prompts and Mission Control.
 * @description The Awtsmoos preserves what was done and what remains without pouring the whole world into a prompt;
 * Awtsmoos.com carries compact tasks, plans, claims, jobs, blockers, and handoff testimony so the next Shliach continues rather than repeats.
 */
function build(mission = {}, options = {}) {
	const tasks = list(mission.tasks);
	const done = tasks.filter(terminalTask);
	const unfinished = tasks.filter(task => !terminalTask(task));
	const collaboration = mission.collaboration || {};
	const room = mission.room || collaboration;
	const claims = list(room.claims || collaboration.claims).filter(item => !closed(item));
	const delegations = list(room.delegations || collaboration.delegations).filter(item => !closed(item));
	return {
		missionId: text(mission.id || mission.missionId, 96),
		goal: text(mission.goal, 600),
		status: text(mission.status, 80),
		phase: text(mission.phase, 120),
		counts: counts(tasks, done, mission),
		completionPercent: tasks.length ? Math.round((done.length / tasks.length) * 100) : 0,
		latestCheckpoint: compactCheckpoint(last(mission.checkpoints)),
		lastCompletedTask: compactTask(done[done.length - 1]),
		unfinishedTasks: unfinished.slice(0, 8).map(compactTask),
		openJobs: list(mission.jobs).filter(item => !closed(item)).slice(0, 6).map(compactItem),
		blockers: list(mission.blockers).slice(-6).map(compactItem),
		openUserMessages: openUserMessages(collaboration).slice(0, 4).map(compactMessage),
		recentPlans: recentPlans(mission),
		activeClaims: claims.slice(0, 8).map(compactItem),
		openDelegations: delegations.slice(0, 8).map(compactItem),
		latestHandoff: compactHandoff(last(room.handoffs || collaboration.handoffs)),
		nextRequiredAction: compactValue(options.lock?.lastMustCallNext || options.lock?.mustCallNext || mission.lastMustCallNext || mission.mustCallNext),
		recentPlanningFiles: list(options.planningFiles).slice(0, 8).map(value => text(value, 240))
	};
}
function counts(tasks, done, mission) {
	return {
		totalTasks: tasks.length,
		doneTasks: done.length,
		openTasks: Math.max(0, tasks.length - done.length),
		jobs: list(mission.jobs).length,
		blockers: list(mission.blockers).length
	};
}
function recentPlans(mission) {
	return [...list(mission.nextPlans), ...list(mission.stepPlans), ...list(mission.chunkPlans)]
		.slice(-8)
		.map(compactPlan);
}
function openUserMessages(collaboration) {
	return list(collaboration.openUserMessages || collaboration.userMessages)
		.filter(item => item?.status === "open" || item?.requiresResponse === true);
}
function compactHandoff(value) {
	if (!value) return null;
	return {
		id: text(value.id, 120), at: text(value.at, 80),
		staleAgentId: text(value.staleAgentId, 120), recoveredBy: text(value.recoveredBy, 120),
		messages: list(value.messages).slice(-6).map(compactMessage),
		claims: list(value.claims).slice(0, 6).map(compactItem)
	};
}
function compactCheckpoint(value) {
	if (!value) return null;
	return {
		id: text(value.id, 120), at: text(value.at, 80), kind: text(value.kind, 80),
		summary: text(value.summary, 600), next: compactValue(value.next)
	};
}
function compactTask(value) {
	if (!value) return null;
	return { id: text(value.id, 120), title: text(value.title || value.name || value.goal, 320), status: text(value.status, 80) };
}
function compactPlan(value) {
	if (!value) return null;
	return { id: text(value.id, 120), step: text(value.step || value.title, 240), status: text(value.status, 80), next: text(value.next || value.summary, 320) };
}
function compactMessage(value) {
	if (!value) return null;
	return { id: text(value.id, 120), from: text(value.fromAgent || value.from, 120), body: text(value.body || value.subject || value.note, 420), status: text(value.status, 80) };
}
function compactItem(value) {
	if (!value) return null;
	return { id: text(value.id, 120), title: text(value.title || value.name || value.action || value.kind, 320), status: text(value.status, 80), by: text(value.by || value.agentId || value.owner, 120) };
}
function compactValue(value) {
	if (value == null) return null;
	if (typeof value !== "object") return text(value, 500);
	return JSON.parse(JSON.stringify(value, (_key, item) => typeof item === "string" ? text(item, 500) : item));
}
function terminalTask(value) {
	return new Set(["done", "completed", "succeeded", "failed", "cancelled"]).has(String(value?.status || "").toLowerCase());
}
function closed(value) {
	return new Set(["done", "completed", "closed", "cancelled", "failed", "released"]).has(String(value?.status || "").toLowerCase());
}
function list(value) {
	if (Array.isArray(value)) return value.filter(Boolean);
	if (value && typeof value === "object") return Object.values(value).filter(Boolean);
	return [];
}
function last(value) {
	const values = list(value);
	return values[values.length - 1] || null;
}
function text(value, limit) {
	return String(value || "").slice(0, limit);
}
module.exports = { build, compactCheckpoint, compactHandoff, compactItem, compactTask, list, terminalTask, text };
