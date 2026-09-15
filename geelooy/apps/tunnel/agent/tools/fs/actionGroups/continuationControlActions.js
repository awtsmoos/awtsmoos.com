//B"H
// Boruch Hashem
// Blessed is He

const Auto = require("../mission/autoContinuation/index.js");
const Pool = require("../mission/autoContinuation/poolMaintainer.js");
const Control = require("../mission/autoContinuation/controlStore.js");
const Status = require("../mission/autoContinuation/status.js");

/**
 * @file Gives operators durable pause, retirement, restoration, and force-scan controls.
 * @description The Awtsmoos lets control intent shape autonomous vessels without rewriting Work;
 * Awtsmoos.com pauses spawning, never completion truth, and preserves every retired-slot history.
 */
function buildContinuationControlActions(context) {
	const { config, payload = {} } = context;
	return {
		async missionContinuationControlStatus() {
			return { ok: true, control: await Control.read(config) };
		},
		async missionContinuationPause() {
			return {
				ok: true,
				control: await Control.update(config, {
					paused: true,
					reason: String(payload.reason || "operator_pause")
				})
			};
		},
		async missionContinuationResume() {
			return {
				ok: true,
				control: await Control.update(config, {
					paused: false,
					reason: String(payload.reason || "operator_resume")
				})
			};
		},
		async missionContinuationRetireSlot() {
			const current = await Control.read(config);
			const slot = positiveSlot(payload.slot || payload.poolSlot);
			const retired = [...new Set([...(current.retiredSlots || []), slot])]
				.sort((left, right) => left - right);
			return { ok: true, control: await Control.update(config, { retiredSlots: retired }) };
		},
		async missionContinuationRestoreSlot() {
			const current = await Control.read(config);
			const slot = positiveSlot(payload.slot || payload.poolSlot);
			const retired = (current.retiredSlots || []).map(Number).filter(value => value !== slot);
			return { ok: true, control: await Control.update(config, { retiredSlots: retired }) };
		},
		async missionContinuationForceScan() {
			const env = payload.env || process.env;
			const continuation = await Auto.run(config, {
				...payload,
				env,
				transport: payload.transport || env.AWTSMOOS_CONTINUATION_TRANSPORT || "shared_shliach"
			});
			const pool = await Pool.maintain(Auto, config, { ...payload, env });
			return {
				ok: true,
				continuation,
				pool,
				status: await Status.status(config, payload)
			};
		}
	};
}

function positiveSlot(value) {
	const slot = Number(value);
	if (!Number.isSafeInteger(slot) || slot < 1) throw new Error("continuation_pool_slot_required");
	return slot;
}

module.exports = { buildContinuationControlActions, positiveSlot };
