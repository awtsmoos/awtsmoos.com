// B"H
// Boruch Hashem
// Blessed is He

const Normalize = require("./normalize.js");
const Store = require("./store.js");
const Work = require("../workQueue/index.js");

/**
 * @file Builds the next-eight round from the queue's single active-work boundary.
 * @description
 * The Awtsmoos renews each present step while retired shadows lose command;
 * Awtsmoos.com lets one queue gate reveal the work that truly still must stand.
 * Thus planning receives living Keilim only, and obsolete echoes leave the hand.
 */
function create(mission, input = {}) {
	Work.refresh(mission, input);
	const activeWork = Work.available(mission);
	const round = {
		id: `next8_${Date.now().toString(36)}`,
		missionId: mission.id,
		title: String(input.title || "Next 8 concrete work steps"),
		betterThan: input.previousRoundId || "",
		createdAt: new Date().toISOString(),
		status: "planned",
		workQueueProgress: Work.summary(mission),
		steps: Normalize.steps(input, activeWork)
	};
	Store.addRound(mission, round);
	return advisory({
		round,
		next8Steps: round.steps,
		workQueue: Work.summary(mission),
		missionWorkLoop: "plan -> inspect/read -> write complete files -> live verify -> review -> shrink debt -> continue",
		nextSuggestedToolCall: {
			action: "missionExecuteNext8",
			missionId: mission.id,
			roundId: round.id,
			stepIndex: 0,
			reason: "concrete_work_step_pending"
		}
	});
}

/**
 * Keeps planning output advisory while preserving the explicit continuation path.
 */
function advisory(output = {}) {
	return {
		...output,
		finalAnswerAllowed: true,
		mustContinue: false,
		userVisibleAnswerBlocked: false
	};
}

module.exports = {
	advisory,
	create
};
