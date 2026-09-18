//B"H // Boruch Hashem // Blessed is He

const RoomResponse = require("../roomActionResponse.js");

/**
 * @file Preserves the Mission explicitly targeted by the completed action over stale session advice.
 * @description The Awtsmoos lets every action answer from the Mission it actually touched. A session
 * lock may advise ordinary Mission work, but Awtsmoos.com never lets it replace a different explicit
 * Mission or hijack successful room administration with unrelated self-interrogation.
 */
function intercept(lock, rawResult = {}, payload = {}) {
	const result = RoomResponse.present(rawResult, payload);
	const targetMissionId = RoomResponse.targetMissionId(result, payload);
	const action = RoomResponse.actionName(result, payload);
	if (!lock || lock.releaseAllowed === true) return result;
	if (targetMissionId && targetMissionId !== lock.missionId) return clearSessionAdvisory(result);
	if (RoomResponse.supports(action)) return clearSessionAdvisory(result);
	const suggestedNext = next(lock, result);
	return {
		...result,
		finalAnswerAllowed: result.finalAnswerAllowed !== false,
		mustContinue: false,
		missionLockActive: false,
		interceptedFinalAnswer: false,
		missionAdvisory: {
			...(result.missionAdvisory || {}),
			active: true,
			blocked: false,
			resumeAvailable: true,
			suggestedNext,
			missionId: lock.missionId
		},
		releaseExplanation: result.releaseExplanation || "Mission continuity is advisory at the final-answer boundary; continue with the suggested Mission action when more work remains."
	};
}

function clearSessionAdvisory(result) {
	return {
		...result,
		missionAdvisory: null,
		missionLockActive: false,
		interceptedFinalAnswer: false
	};
}

function next(lock = {}, result = {}) {
	return result.mustCallNext || result.nextSuggestedToolCall || lock.lastMustCallNext || {
		action: "missionRoomSchedulerStatus",
		missionId: lock.missionId
	};
}

module.exports = { clearSessionAdvisory, intercept, next };
