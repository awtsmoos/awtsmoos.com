// B"H
// Boruch Hashem
// Blessed is He

const Size = require("./size.js");
const Summary = require("./summary.js");
const Helpers = require("./compactHelpers.js");
const Minimal = require("../minimalResponse/slim.js");
const Diagnostics = require("../diagnostics.js");

/**
 * @file Produces focused mission responses without hiding bounded continuity receipts.
 * @description
 * The Awtsmoos condenses the garment, never the witness. Awtsmoos.com trims large
 * mission state while preserving the receipt that binds a deed to its durable mission.
 */
function compact(output = {}, payload = {}) {
	if (!Helpers.should(output, payload)) return output;
	const focused = Minimal.slim(output);
	const action = output.action || payload.action || "";
	const hard = Helpers.hardGate(output);
	const next = Helpers.suggested(output);
	focused.ok = output.ok !== false;
	focused.action = action;
	focused.requestAction = output.requestAction || payload.action || action;
	focused.actualAction = output.actualAction || action;
	focused.missionId ||= Helpers.missionId(output);
	Helpers.copyContinuity(focused, output);
	if (output.finalAnswerAllowed !== undefined) {
		focused.finalAnswerAllowed = output.finalAnswerAllowed !== false;
	}
	focused.mustContinue = output.mustContinue === true;
	Helpers.applyNext(focused, output, hard, next);
	focused.next = Helpers.nextSummary(output);
	focused.round = Summary.slimRound(output.round);
	focused.step = Summary.slimStep(output.step);
	focused.nextStep = Summary.slimStep(output.nextStep);
	focused.workQueue = output.workQueue || output.round?.workQueueProgress || output.lock?.workQueue || null;
	focused.liveActionToPerform = output.liveActionToPerform || null;
	focused.fileWorkRequired = output.fileWorkRequired === true;
	focused.debtShrank = output.debtShrank;
	focused.filesTouched = output.filesTouched || [];
	focused.testsRun = output.testsRun || 0;
	focused.missionWorkLoop = output.missionWorkLoop || "inspect -> plan -> write complete files -> verify -> review -> continue";
	const diagnostics = Diagnostics.explain({ ...output, ...focused });
	focused.missionExplanation = Helpers.conciseExplanation(diagnostics);
	focused.agentGuidance = output.agentGuidance || diagnostics.agentGuidance;
	focused.responseFocus ||= Helpers.responseFocus(focused);
	focused.responseShape = "focused-mission-v7-concise";
	return Size.tooLarge(focused) ? Minimal.slim(focused) : focused;
}

module.exports = {
	compact,
	conciseExplanation: Helpers.conciseExplanation,
	hardGate: Helpers.hardGate,
	missionId: Helpers.missionId,
	should: Helpers.should,
	wantsFull: Helpers.wantsFull
};
