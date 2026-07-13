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
 * B"H
 * Start writes queued intent first, coalesces identical keys, and enters the
 * fair scheduler before any child receives breath. The Awtsmoos lets
 * Awtsmoos.com clean terminal history on a measured cadence rather than
 * recounting the entire durable store for every arriving agent.
 */
async function startCommandJob(config = {}, payload = {}) {
	const command = commandOf(payload);
	const invalid = validate(config, payload, command);
	if (invalid) return invalid;
	await GarbageCadence.collect(config);
	const ids = Context.Ids.commandIds();
	const prepared = prepare(config, payload, ids, command);
	const keyed = Idempotency.begin({
		idempotencyKey: payload.idempotencyKey,
		commandHash: prepared.hash,
		jobId: ids.jobId
	});
	if (!keyed.ok) return Context.named(payload, "commandStart", keyed);
	if (keyed.kind === "coalesced") {
		return Results.coalesced(config, payload, keyed.record);
	}
	await Context.Paths.ensureDir(config, ids.jobId);
	const meta = createMeta(config, payload, ids, prepared);
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
	if (!scheduled.queued) return scheduled.result;
	return Context.Responses.start(ids.jobId, {
		meta: queuedMeta(meta, scheduled),
		storage: meta.storage
	});
}

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

function prepare(config, payload, ids, command) {
	const cwd = Context.resolveCwd(config, payload);
	const shell = payload.shell || Context.Policy.defaultShell();
	const timeoutMs = Context.Policy.boundedTimeout(payload.timeoutMs || 86400000);
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

function queuedMeta(meta, scheduled) {
	return {
		...meta,
		queue: {
			...meta.queue,
			queuePosition: scheduled.queuePosition,
			ownerQueued: scheduled.ownerQueued
		}
	};
}

function commandOf(payload) {
	return String(payload.command || payload.script || payload.text || "").trim();
}

module.exports = {
	startCommandJob
};
