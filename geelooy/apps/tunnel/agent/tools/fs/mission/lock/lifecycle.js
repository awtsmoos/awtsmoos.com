// B"H
// Boruch Hashem
// Blessed is He

const Config = require("./config.js");
const Persistence = require("./persistence.js");
const RootBinding = require("./rootBinding.js");
const Stuck = require("../stuckness/index.js");
const Seed = require("../autoSeed/index.js");
const Questions = require("../questionSnapshot.js");

/**
 * @file Creates mission authority around the living repository rather than a broad old root.
 * @description
 * The Awtsmoos gives each mission one truthful hand upon the present vessel; Awtsmoos.com
 * refreshes that hand when stronger cwd evidence appears, while preserving gates, receipts,
 * progress, and verification so continuity moves forward without dragging yesterday's path.
 */
function windowMs(payload = {}) {
	return payload.minimumInnovationWindowMs ?? payload.minimumRuntimeMs ?? 3600000;
}

function workFrom(result = {}) {
	return result.workQueue || result.round?.workQueueProgress || result.workQueueProgress || null;
}

function start(config, result = {}, payload = {}) {
	const missionId = result.missionId || result.mission?.id || payload.missionId;
	if (!missionId) return null;
	const parent = Persistence.read(config);
	const seed = Seed.next(missionId, payload);
	const work = workFrom(result);
	const lock = {
		projectRoot: RootBinding.initial(config, payload, result),
		missionId,
		parentMissionId: parent?.missionId || "",
		mode: payload.missionLockMode || Config.DEFAULT_MODE,
		releaseStatus: Config.LOCKED,
		releaseAllowed: false,
		authorityState: "active",
		authorityGeneration: `${Date.now()}-${process.pid}`,
		startedAt: Config.now(),
		updatedAt: Config.now(),
		minimumUntil: Config.minimumUntil(windowMs(payload)),
		owner: payload.owner || "daemon",
		lastMustCallNext: seed || result.mustCallNext || result.nextRequiredAction || null,
		blockedOn: gate(result),
		receipts: [],
		workQueue: work,
		workProgress: work?.progress || null,
		filesTouched: [],
		testsRun: 0
	};
	RootBinding.bind(config, lock);
	persist(config, lock);
	return lock;
}

function update(config, result = {}, payload = {}) {
	const lock = Persistence.read(config);
	if (!lock || lock.releaseAllowed === true || lock.authorityState === "revoked") return lock || null;
	lock.updatedAt = Config.now();
	lock.lastAction = result.action || payload.action || "";
	RootBinding.refresh(config, lock, payload, result);
	const next = result.mustCallNext || result.nextRequiredAction || null;
	if (next) {
		lock.lastMustCallNext = next;
		Stuck.apply(lock, next);
	}
	const work = workFrom(result);
	if (work) {
		lock.workQueue = work;
		lock.workProgress = work.progress || work;
	}
	if (Array.isArray(result.filesTouched)) {
		lock.filesTouched = [...new Set([...(lock.filesTouched || []), ...result.filesTouched])];
	}
	if (Number(result.testsRun || 0) > 0) {
		lock.testsRun = Number(lock.testsRun || 0) + Number(result.testsRun || 0);
	}
	if (result.releaseToken) lock.releaseToken = result.releaseToken;
	lock.blockedOn = gate(result) || lock.blockedOn || null;
	mark(lock, result);
	persist(config, lock);
	return lock;
}

function persist(config, lock) {
	lock.persistence = Persistence.persist(config, lock);
	return lock.persistence;
}

function mark(lock, result = {}) {
	if (/Verify|Test|Scheduler|DaemonTick|command/i.test(result.action || "") || Number(result.testsRun || 0) > 0) {
		lock.verificationSeen = true;
	}
	if (Array.isArray(result.filesTouched) && result.filesTouched.length) lock.fileWriteSeen = true;
}

function gate(result = {}) {
	const question = result.multipleChoiceSelfInterrogation || result.next?.question;
	if (!question) return null;
	return {
		action: "missionAnswer",
		questionId: question.questionId || question.id,
		recommendedAnswer: question.recommendedAnswer || "",
		expectedAnswerFormat: question.expectedAnswerFormat || "",
		question: Questions.snapshot(question)
	};
}

module.exports = { gate, mark, start, update, windowMs, workFrom };
