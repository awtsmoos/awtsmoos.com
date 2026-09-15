//B"H
// Boruch Hashem
// Blessed is He

const Auto = require("../mission/autoContinuation/index.js");
const Pool = require("../mission/autoContinuation/poolMaintainer.js");
const Status = require("../mission/autoContinuation/status.js");

/**
 * @file Exposes continuation status, one-shot pulse, and dry capsule inspection.
 * @description The Awtsmoos lets operators see and summon the same engine the heartbeat uses;
 * Awtsmoos.com never hides debt, pool custody, or successor context behind automatic machinery.
 */
function buildContinuationActions(context) {
	const { config, payload = {} } = context;
	return {
		async missionContinuationStatus() {
			return Status.status(config, payload);
		},
		async missionContinuationCapsule() {
			return Status.capsule(config, payload);
		},
		async missionContinuationPulse() {
			const env = payload.env || process.env;
			const continuation = await Auto.run(config, {
				...payload,
				env,
				transport: payload.transport || env.AWTSMOOS_CONTINUATION_TRANSPORT || "shared_shliach"
			});
			const pool = await Pool.maintain(Auto, config, {
				...payload,
				env,
				transport: payload.transport || env.AWTSMOOS_CONTINUATION_TRANSPORT || "shared_shliach"
			});
			return {
				ok: true,
				continuation,
				pool,
				status: await Status.status(config, payload)
			};
		}
	};
}

module.exports = { buildContinuationActions };
