//B"H
// Boruch Hashem
// Blessed is He

const Work = require("../workRegistry.js");
const Obligations = require("../../workGraph/obligationStore.js");
const Disposition = require("./debtDisposition.js");

/**
 * @file Measures true completion debt and whether autonomous continuation can act on it now.
 * @description The Awtsmoos keeps incomplete truth visible even when a human, blocker, deferral,
 * or required review makes another successor useless; Awtsmoos.com separates green from runnable.
 */
function compactWork(item = {}) {
	return {
		id: item.id || "",
		title: item.title || item.summary || "",
		state: item.state || "open"
	};
}

function compactObligation(item = {}) {
	return {
		obligationId: item.obligationId || "",
		title: item.title || "",
		workId: item.workId || ""
	};
}

async function finalization(Mission, mission) {
	if (!Mission || typeof Mission.finalizeVerdict !== "function") {
		return { ok: false, unavailable: true, issues: ["finalization_verdict_unavailable"] };
	}
	try {
		const verdict = await Promise.resolve(Mission.finalizeVerdict(mission, {}));
		return {
			ok: verdict?.ok === true || verdict?.releasable === true,
			issues: Array.isArray(verdict?.issues) ? verdict.issues : [],
			suggestedNext: verdict?.suggestedNext || verdict?.mustCallNext || null
		};
	} catch (error) {
		return {
			ok: false,
			unavailable: true,
			issues: [error?.message || "finalization_verdict_failed"]
		};
	}
}

async function assess(config, mission = {}, lock = {}, context = {}, deps = {}) {
	const logicalAgentId = String(
		context.logicalAgentId || context.successorAgentId || lock.logicalAgentId || ""
	);
	const remainingWork = Work.open(mission).map(compactWork);
	const obligations = logicalAgentId
		? (await Obligations.current(config, {
			logicalAgentId,
			missionId: mission.missionId || mission.id || "",
			state: "open"
		})).map(compactObligation)
		: [];
	const mustCallNext = lock.lastMustCallNext || lock.mustCallNext || null;
	const verdict = await finalization(deps.Mission, mission);
	const reasons = [];
	if (remainingWork.length) reasons.push("remaining_work");
	if (obligations.length) reasons.push("open_obligations");
	if (mustCallNext?.action || mustCallNext?.name) reasons.push("must_call_next");
	if (!verdict.ok) reasons.push("finalization_not_green");
	const green = reasons.length === 0;
	const disposition = Disposition.classify(mission, lock);
	return {
		green,
		runnable: !green && disposition.runnable,
		disposition: green ? "complete" : disposition.disposition,
		dispositionReason: green ? "" : disposition.reason,
		reasons,
		counts: {
			remainingWork: remainingWork.length,
			openObligations: obligations.length,
			finalizationIssues: verdict.issues.length,
			mustCallNext: mustCallNext ? 1 : 0
		},
		remainingWork,
		obligations,
		mustCallNext,
		finalization: verdict
	};
}

module.exports = { assess, compactObligation, compactWork, finalization };
