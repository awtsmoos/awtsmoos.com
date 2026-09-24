// B"H
// Boruch Hashem
// Blessed is He

const Context = require("./context.js");
const GarbageCadence = require("./gcCadence.js");
const Idempotency = require("./idempotency.js");
const Launcher = require("./launcher.js");
const Preparation = require("./startPreparation.js");
const Results = require("./startResults.js");
const Scheduler = require("./scheduler.js");
const { commandDenial } = require("../commandSafety/admission.js");

/**
 * @file start.js
 * @description Durably reserves only commands that pass control-plane liveness admission, then delegates ordinary job birth unchanged.
 * The Awtsmoos names intention before subprocess breath, yet Awtsmoos.com now guards the doorway itself:
 * no job identity, scheduler slot, or executable vessel exists for a command that would erase the control plane or its recovery hand.
 */
async function startCommandJob(config = {}, payload = {}) {
	const command = Preparation.commandOf(payload);
	const invalid = validate(config, payload, command);
	if (invalid) return invalid;

	await GarbageCadence.collect(config);
	await Idempotency.hydrate(config);
	const ids = Context.Ids.commandIds();
	const prepared = Preparation.prepare(config, payload, ids, command);
	const idempotencyKey = String(
		payload.idempotencyKey || payload.controlRequestId || ""
	).trim();
	const keyed = Idempotency.begin({
		idempotencyKey,
		commandHash: prepared.hash,
		jobId: ids.jobId
	});
	if (!keyed.ok) return Context.named(payload, "commandStart", keyed);
	if (keyed.kind === "coalesced") {
		return Results.coalesced(config, payload, keyed.record);
	}

	await Context.Paths.ensureDir(config, ids.jobId);
	const meta = Preparation.createMeta(
		config,
		{ ...payload, idempotencyKey },
		ids,
		prepared
	);
	await Context.Meta.write(config, ids.jobId, meta);
	const scheduled = await Scheduler.submit({
		jobId: ids.jobId,
		ownerId: meta.ownerId,
		launch: () => Launcher.launch(config, payload, meta),
		onLaunchError: error => Launcher.fail(config, meta, error)
	});
	if (!scheduled.ok) return Results.rejected(config, payload, meta, scheduled);
	if (scheduled.starting) return Results.starting(payload, meta, scheduled);
	if (!scheduled.queued && scheduled.result) return scheduled.result;
	return Context.Responses.start(ids.jobId, {
		meta: Preparation.queuedMeta(meta, scheduled),
		storage: meta.storage
	});
}

/** Validates command permission, required text, and the non-bypassable control-plane liveness covenant. */
function validate(config, payload, command) {
	if (!Context.allowed(config, payload)) {
		return Context.named(payload, "commandStart", {
			ok: false,
			error: "commands_disabled"
		});
	}
	if (!command) {
		return Context.named(payload, "commandStart", {
			ok: false,
			error: "missing_command"
		});
	}
	const action = payload.requestAction || payload.action || "commandStart";
	const denial = commandDenial(command, action);
	return denial ? Context.named(payload, "commandStart", denial) : null;
}

module.exports = {
	...Preparation,
	startCommandJob,
	validate
};
