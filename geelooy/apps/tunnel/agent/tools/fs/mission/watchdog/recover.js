// B"H
// Boruch Hashem
// Blessed is He

const Lock = require("../lock/index.js");
const Mission = require("../index.js");
const Questions = require("../questionSnapshot.js");

/**
 * @file Recovers watchdog gates from durable question evidence or revokes orphaned write authority.
 * @description
 * The Awtsmoos restores the full question when its durable letters still shine;
 * Awtsmoos.com releases only filesystem authority when A–E is truly gone, preserving the mission line.
 */
async function recover(config) {
	const lock = Lock.active(config);
	if (!lock) return advisory({ ok: true, action: "missionWatchdogRecover", recovered: false });
	lock.watchdogRecoveredAt = new Date().toISOString();
	Lock.set(config, lock);
	const questionId = gateQuestionId(lock);
	if (!questionId) return continueFrom(lock);
	const mission = await load(config, lock.missionId);
	const question = Questions.resolve(mission || {}, questionId, lock);
	if (!question) return orphan(config, lock, questionId);
	const nextSuggestedToolCall = {
		action: "missionAnswer",
		missionId: lock.missionId,
		questionId,
		expectedAnswerFormat: question.expectedAnswerFormat,
		recommendedAnswer: question.recommendedAnswer
	};
	return advisory({
		ok: true,
		action: "missionWatchdogRecover",
		recovered: true,
		questionRecovered: true,
		multipleChoiceSelfInterrogation: question,
		nextSuggestedToolCall,
		missionAdvisory: advisoryState(lock, nextSuggestedToolCall)
	});
}

function continueFrom(lock) {
	const nextSuggestedToolCall = lock.lastMustCallNext || {
		action: "missionNext",
		missionId: lock.missionId
	};
	return advisory({
		ok: true,
		action: "missionWatchdogRecover",
		recovered: true,
		nextSuggestedToolCall,
		missionAdvisory: advisoryState(lock, nextSuggestedToolCall)
	});
}

function orphan(config, lock, questionId) {
	Lock.revoke(config, { action: "missionWatchdogRecover", missionId: lock.missionId }, "question_payload_missing");
	const nextSuggestedToolCall = {
		action: "missionGet",
		missionId: lock.missionId,
		reason: "question_payload_missing"
	};
	return advisory({
		ok: false,
		action: "missionWatchdogRecover",
		error: "question_payload_missing",
		recovered: false,
		questionOrphaned: true,
		questionId,
		missionId: lock.missionId,
		filesystemAuthorityRevoked: true,
		nextSuggestedToolCall,
		missionAdvisory: {
			active: false,
			blocked: false,
			resumeAvailable: true,
			suggestedNext: nextSuggestedToolCall,
			missionId: lock.missionId
		}
	});
}

async function load(config, missionId) {
	try {
		return await Mission.load(config, missionId);
	} catch {
		return null;
	}
}

function gateQuestionId(lock = {}) {
	return String(
		lock.blockedOn?.questionId ||
		lock.lastMustCallNext?.questionId ||
		lock.lastMustCallNext?.gateQuestionId ||
		""
	);
}

function advisoryState(lock, next) {
	return {
		active: true,
		blocked: false,
		resumeAvailable: true,
		suggestedNext: next,
		missionId: lock.missionId
	};
}

function advisory(out = {}) {
	return { ...out, finalAnswerAllowed: true, mustContinue: false, userVisibleAnswerBlocked: false };
}

module.exports = { advisory, gateQuestionId, recover };
