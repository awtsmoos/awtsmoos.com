// B"H

const Scheduler = require("../daemon/scheduler.js");
const Transaction = require("../transaction/index.js");
const Defaults = require("./defaults.js");
const Store = require("./store.js");

function envelope(action, record, extra = {}) {
	return {
		ok: record.ok !== false,
		action,
		missionId: record.missionId || "",
		continuation: record.control || null,
		...extra,
		...(record.ok === false
			? { error: record.error, expectedRevision: record.expectedRevision }
			: {})
	};
}

function stateMutation(desiredState, reason) {
	return control => ({
		...control,
		desiredState,
		lastReason: reason || `set_${desiredState}`
	});
}

function resourceEvidence(config, payload) {
	return {
		scheduler: Scheduler.status(config, payload),
		schedulerRegistry: Scheduler.snapshot(),
		transactions: Transaction.snapshot()
	};
}

function build(context, buildActions) {
	const { config, payload } = context;
	return {
		async missionTurnStatus() {
			const record = await Store.read(config, payload);
			return envelope("missionTurnStatus", record, {
				...resourceEvidence(config, payload),
				presets: Defaults.PRESETS
			});
		},
		async missionTurnSet() {
			const record = await Store.patch(config, payload);
			if (record.ok && record.control.desiredState === "running") {
				Scheduler.start(config, {
					...payload,
					missionId: record.missionId,
					intervalMs: record.control.intervalMs
				}, buildActions);
			}
			return envelope("missionTurnSet", record, resourceEvidence(config, payload));
		},
		async missionTurnPause() {
			const record = await Store.mutate(config, payload, stateMutation("paused", payload.reason));
			return envelope("missionTurnPause", record, resourceEvidence(config, payload));
		},
		async missionTurnResume() {
			const record = await Store.mutate(config, payload, stateMutation("running", payload.reason));
			if (record.ok) Scheduler.start(config, { ...payload, intervalMs: record.control.intervalMs }, buildActions);
			return envelope("missionTurnResume", record, resourceEvidence(config, payload));
		},
		async missionTurnDrain() {
			const record = await Store.mutate(config, payload, stateMutation("draining", payload.reason));
			return envelope("missionTurnDrain", record, resourceEvidence(config, payload));
		},
		async missionTurnStop() {
			const record = await Store.mutate(config, payload, stateMutation("stopped", payload.reason));
			if (record.ok) Scheduler.stop(config, { ...payload, missionId: record.missionId });
			return envelope("missionTurnStop", record, resourceEvidence(config, payload));
		},
		async missionTurnOnce() {
			const record = await Store.mutate(config, payload, control => ({
				...control,
				desiredState: "paused",
				oneTurnCredits: control.oneTurnCredits + 1,
				lastReason: payload.reason || "one_turn_requested"
			}));
			if (record.ok) Scheduler.start(config, { ...payload, intervalMs: record.control.intervalMs }, buildActions);
			return envelope("missionTurnOnce", record, resourceEvidence(config, payload));
		},
		async missionResourceStatus() {
			const record = await Store.read(config, payload);
			return envelope("missionResourceStatus", record, resourceEvidence(config, payload));
		}
	};
}

module.exports = { build, envelope, resourceEvidence, stateMutation };
