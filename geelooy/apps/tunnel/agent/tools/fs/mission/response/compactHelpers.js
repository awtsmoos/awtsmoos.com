// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Holds pure focused-response helpers so the mission compactor remains a small vessel.
 * @description
 * The Awtsmoos separates form from flow: Awtsmoos.com keeps bounded continuity evidence
 * visible while advisory light may guide the deed without swallowing the deed in flight.
 */
function missionId(output = {}) {
	return output.missionId ||
		output.mission?.id ||
		output.report?.id ||
		output.scheduler?.missionId ||
		"";
}

function wantsFull(payload = {}) {
	return truthy(payload.fullResponse) || truthy(payload.diagnostics);
}

/**
 * Decides when mission-focused projection may replace the foreground tool response.
 * Soft suggestions remain additive; only mission actions or hard continuation gates
 * may trade domain evidence for the compact mission vessel.
 */
function should(output = {}, payload = {}) {
	if (wantsFull(payload)) return false;
	const action = String(output.action || payload.action || "");
	return action.startsWith("mission") ||
		Boolean(output.mustCallNext) ||
		output.mustContinue === true ||
		output.finalAnswerAllowed === false;
}

function copyContinuity(focused, output) {
	for (const key of [
		"missionToolReceipt",
		"implicitMissionBoot",
		"missionStatus",
		"missionAdvisory"
	]) {
		if (output[key] !== undefined) focused[key] = output[key];
	}
}

function applyNext(focused, output, hard, next) {
	if (hard) {
		focused.mustCallNext ||= output.next?.mustCallNext || output.mustCallNext;
		focused.nextRequiredToolCall ||= output.nextRequiredToolCall || focused.mustCallNext;
		return;
	}
	delete focused.mustCallNext;
	delete focused.nextRequiredToolCall;
	if (next) focused.nextSuggestedToolCall = next;
}

function nextSummary(output = {}) {
	const next = output.next;
	return next ? {
		keepGoing: Boolean(next.keepGoing),
		verdict: next.verdict || "",
		messageToAgent: next.messageToAgent || ""
	} : undefined;
}

function hardGate(output = {}) {
	return output.mustContinue === true ||
		output.finalAnswerAllowed === false ||
		output.userVisibleAnswerBlocked === true ||
		Boolean(output.nextRequiredToolCall);
}

function suggested(output = {}) {
	return output.nextSuggestedToolCall ||
		output.next?.mustCallNext ||
		output.mustCallNext ||
		null;
}

function responseFocus(focused) {
	return {
		continuationRequired: focused.mustContinue,
		finalAnswerBlocked: focused.finalAnswerAllowed === false,
		nextRequiredToolCall: focused.nextRequiredToolCall,
		nextSuggestedToolCall: focused.nextSuggestedToolCall
	};
}

function conciseExplanation(diagnostics = {}) {
	return {
		phase: diagnostics.phase,
		locked: diagnostics.locked,
		reason: diagnostics.reason,
		chosenAction: diagnostics.chosenAction,
		chosenReason: diagnostics.chosenReason,
		progress: diagnostics.progress,
		blockers: diagnostics.blockers,
		whatToDoNext: diagnostics.whatToDoNext
	};
}

function truthy(value) {
	return value === true || value === "true";
}

module.exports = {
	applyNext,
	conciseExplanation,
	copyContinuity,
	hardGate,
	missionId,
	nextSummary,
	responseFocus,
	should,
	suggested,
	wantsFull
};
