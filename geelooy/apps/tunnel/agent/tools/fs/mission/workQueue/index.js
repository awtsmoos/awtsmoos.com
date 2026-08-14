// B"H
// Boruch Hashem
// Blessed is He

const FromGoal = require("./fromGoal.js");
const Progress = require("./progress.js");
const Reconcile = require("./reconcile.js");

/**
 * @file Coordinates durable mission work-queue lifecycle boundaries.
 * @description
 * The Awtsmoos renews each obligation while history remains a faithful scroll;
 * Awtsmoos.com keeps retired work from steering the present mission goal.
 * One active-work gate feeds every planner, so stale shadows cannot seize control.
 */
function ensure(mission = {}) {
	mission.workQueue ||= FromGoal.create(mission);
	return mission.workQueue;
}

/** Reconciles freshly generated work with durable queue history. */
function refresh(mission, input = {}) {
	const missionQueue = ensure(mission);
	const generatedOros = FromGoal.items(mission, input);
	missionQueue.items = Reconcile.merge(missionQueue.items, generatedOros);
	missionQueue.updatedAt = new Date().toISOString();
	Progress.recount(missionQueue);
	return missionQueue;
}

/**
 * Returns every current actionable item through one shared lifecycle predicate.
 *
 * @param {object} mission Durable mission state.
 * @returns {object[]} Current unfinished work safe for planners and executors.
 */
function available(mission) {
	return ensure(mission).items.filter(isActionable);
}

/** Returns the first current actionable item. */
function pending(mission) {
	return available(mission)[0] || null;
}

/**
 * Applies verified step evidence while refusing to mutate retired history.
 */
function applyStep(mission, step = {}, input = {}) {
	const missionQueue = ensure(mission);
	const workKey = step.workKey || step.id;
	const workItem = missionQueue.items.find(item => item.key === workKey) || null;
	if (!isMutable(workItem)) {
		return Progress.recount(missionQueue);
	}
	if (input.blocked) {
		workItem.status = "blocked";
	} else if (hasEvidence(input)) {
		workItem.status = "done";
	} else {
		workItem.status = workItem.kind === "plan" ? "done" : "in_progress";
	}
	workItem.lastEvidence = input.evidence || input.proof || input.actual || input.output || "";
	workItem.updatedAt = new Date().toISOString();
	return Progress.recount(missionQueue);
}

/** Returns a compact current-work summary plus durable progress metrics. */
function summary(mission) {
	return Progress.summary(ensure(mission));
}

function hasEvidence(input = {}) {
	return Boolean(input.executed || input.done || input.evidence || input.proof || input.actual);
}

function isActionable(workItem = {}) {
	return workItem.current !== false
		&& workItem.status !== "done"
		&& workItem.status !== "obsolete";
}

function isMutable(workItem) {
	return Boolean(workItem)
		&& workItem.current !== false
		&& workItem.status !== "obsolete";
}

module.exports = {
	applyStep,
	available,
	ensure,
	pending,
	refresh,
	summary
};
