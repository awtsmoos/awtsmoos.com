// B"H
// Boruch Hashem
// Blessed is He

const Context = require("./context.js");
const GarbageCadence = require("./gcCadence.js");
const Idempotency = require("./idempotency.js");
const Launcher = require("./launcher.js");
const Results = require("./startResults.js");
const Scheduler = require("./scheduler.js");

/**
 * @file Durably reserves one command job and returns custody before physical launch settles.
 * @description
 * The Awtsmoos gives intention a stable name before the subprocess takes breath.
 * Awtsmoos.com writes the queue/job vessel first, then lets scheduler birth unfold
 * outside the tunnel request's acceptance-critical stack so control remains free.
 */
async function startCommandJob(config = {}, payload = {}) {
	const command = commandOf(payload);
	const invalid = validate(config, payload, command);
	if (invalid) return invalid;

	await GarbageCadence.collect(config);
	await Idempotency.hydrate(config);

	const ids = Context.Ids.commandIds();
	const prepared = prepare(config, payload, ids, command);
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
	const meta = createMeta(
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

	if (!scheduled.ok) {
		return Results.rejected(config, payload, meta, scheduled);
	}
	if (scheduled.starting) {
		return Results.starting(payload, meta, scheduled);
	}
	if (!scheduled.queued && scheduled.result) {
		return scheduled.result;
	}
	return Context.Responses.start(ids.jobId, {
		meta: queuedMeta(meta, scheduled),
		storage: meta.storage
	});
}

/** Validates command permission and required command text. */
function validate(config, payload, command) {
	if (!Context.allowed(config, payload)) {
		return Context.named(payload, "commandStart", {
			ok: false,
			error: "commands_disabled"
		});
	}
	return command ? null : Context.named(payload, "commandStart", {
		ok: false,
		error: "missing_command"
	});
}

/** Resolves immutable launch identity and command fingerprint inputs. */
function prepare(config, payload, ids, command) {
	const cwd = Context.resolveCwd(config, payload);
	const shell = payload.shell || Context.Policy.defaultShell();
	const timeoutMs = Context.Policy.boundedTimeout(
		payload.timeoutMs || 86400000
	);
	return {
		command,
		cwd,
		shell,
		timeoutMs,
		hash: Idempotency.commandHash({
			command,
			cwd,
			shell,
			env: payload.env || {}
		}),
		ids
	};
}

/** Builds durable job metadata before scheduler admission. */
function createMeta(config, payload, ids, prepared) {
	const meta = Context.MetaFactory.createMeta({
		...prepared,
		...ids,
		config,
		payload
	});
	meta.ownerId = Scheduler.ownerOf(payload);
	meta.commandHash = prepared.hash;
	meta.idempotencyKey = String(payload.idempotencyKey || "").trim() || undefined;
	meta.queue = {
		ownerId: meta.ownerId,
		queuedAt: new Date().toISOString()
	};
	return meta;
}

/** Adds scheduler queue evidence to the public start receipt. */
function queuedMeta(meta, scheduled) {
	return {
		...meta,
		queue: {
			...meta.queue,
			queuePosition: scheduled.queuePosition,
			ownerQueued: scheduled.ownerQueued,
			queued: true,
			starting: false
		}
	};
}

/** Returns normalized command text from every public command alias. */
function commandOf(payload = {}) {
	return String(payload.command || payload.script || payload.text || "").trim();
}

module.exports = {
	commandOf,
	createMeta,
	prepare,
	queuedMeta,
	startCommandJob,
	validate
};
