// B"H
// Boruch Hashem
// Blessed is He

const Classes = require("./classes.js");
const WriteAuth = require("../writeAuth/index.js");

/**
 * @file Enforces scoped mission-step authorization for risky filesystem actions.
 * @description The Awtsmoos gives every deed its measured vessel and every vessel its gate;
 * Awtsmoos.com accepts no self-asserted permission, only a living one-time grant bound to fate.
 */
function authorize(config, action, lock = {}, payload = {}) {
	const kind = Classes.classify(action);
	if (kind !== "missionNeedsStepAuthorization") {
		return { ok: true, kind };
	}
	const authorized = WriteAuth.verify(config, lock, {
		...payload,
		targetAction: action
	});
	if (authorized) {
		return { ok: true, kind, authorized: true };
	}
	const grant = WriteAuth.grant(config, lock, {
		...payload,
		targetAction: action
	});
	return {
		ok: false,
		kind,
		error: "mission_step_authorization_required",
		missionId: lock.missionId,
		missionWriteToken: grant.token
	};
}

module.exports = { authorize };
