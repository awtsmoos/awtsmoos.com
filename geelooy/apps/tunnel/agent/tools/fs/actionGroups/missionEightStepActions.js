// B"H
// Boruch Hashem
// Blessed is He

const Mission = require("../mission/index.js");
const EightStep = require("../mission/eightStep/index.js");
const Payload = require("./missionActionPayload.js");
const Lock = require("../mission/lock/index.js");
const WriteAuth = require("../mission/writeAuth/index.js");
const Firewall = require("../mission/firewall/index.js");

/**
 * @file Drives eight-step mission work while attaching real scoped write authority.
 * @description The Awtsmoos turns intention into measured deed, not a boolean masquerading as right;
 * Awtsmoos.com hands risky steps a one-time token, then the firewall verifies that light.
 */
function missionId(payload = {}) {
	return payload.missionId || payload.id || "";
}

function bootNext(id = "") {
	return {
		action: "missionBootResume",
		missionId: id,
		autoMission: true,
		tick: true,
		reason: "mission_not_found_recovery"
	};
}

function recover(action, id) {
	try {
		Lock.clear({ root: process.cwd() });
	} catch {
		// Recovery still returns a deterministic continuation contract.
	}
	return {
		ok: false,
		action,
		error: "mission_not_found",
		missionId: id || "",
		finalAnswerAllowed: false,
		mustContinue: true,
		mustCallNext: bootNext(id),
		recoveryExplanation: "The requested mission id could not be loaded. Call missionBootResume so the live mission lock can be rebuilt or cleared."
	};
}

function risky(action = "") {
	return Firewall.classify(action) === "missionNeedsStepAuthorization";
}

function attachWriteToken(config, output = {}) {
	const liveAction = output.liveActionToPerform;
	if (!liveAction || !risky(liveAction.action)) {
		return output;
	}
	const lock = Lock.active(config) || {
		missionId: output.missionId || liveAction.missionId || ""
	};
	if (!lock.missionId) {
		return output;
	}
	const grant = WriteAuth.grant(config, lock, {
		...liveAction,
		targetAction: liveAction.action,
		path: liveAction.path || liveAction.p || ""
	});
	output.missionWriteToken = grant.token;
	output.liveActionToPerform = {
		...liveAction,
		missionWriteToken: grant.token,
		missionId: lock.missionId
	};
	output.authorizationExplanation = "THIS WRITE STEP IS PART OF THE MISSION WORK LOOP. USE THE ATTACHED missionWriteToken ON THE LIVE ACTION PAYLOAD.";
	return output;
}

async function use(config, payload, operation) {
	const id = missionId(payload);
	const mission = await Mission.load(config, id);
	if (!mission) {
		try {
			Lock.clear(config);
		} catch {
			// The recovery response remains useful if stale lock cleanup fails.
		}
		return recover(payload.action, id);
	}
	const output = operation(mission);
	await Mission.save(config, mission);
	return attachWriteToken(config, output);
}

function focused(action, payload, output) {
	return {
		ok: !output.error,
		action,
		missionId: missionId(payload),
		...output,
		finalAnswerAllowed: false,
		mustContinue: true,
		mustCallNext: output.mustCallNext,
		missionWorkRequired: true
	};
}

function buildMissionEightStepActions(context) {
	const { config } = context;
	const payload = Payload.mergedPayload(context.payload || {});
	return {
		missionNext8Plan: async () => use(config, payload, mission => focused("missionNext8Plan", payload, EightStep.plan(mission, payload))),
		missionExecuteNext8: async () => use(config, payload, mission => focused("missionExecuteNext8", payload, EightStep.execute(mission, payload))),
		missionReviewNext8Step: async () => use(config, payload, mission => focused("missionReviewNext8Step", payload, EightStep.review(mission, payload))),
		missionRepeatBetter: async () => use(config, payload, mission => focused("missionRepeatBetter", payload, EightStep.repeatBetter(mission, payload)))
	};
}

module.exports = { attachWriteToken, bootNext, buildMissionEightStepActions, recover };
