// B"H
const Context = require('./context.js');
const Idempotency = require('./idempotency.js');
const Launcher = require('./launcher.js');
const Lifecycle = require('./lifecycle.js');
const Scheduler = require('./scheduler.js');

/**
 * B"H — Start writes queued intent first, coalesces identical keys, and enters
 * the fair scheduler before any child receives breath.
 */
async function startCommandJob(config = {}, payload = {}) {
	if (!Context.allowed(config, payload)) {
		return Context.named(payload, 'commandStart', { ok: false, error: 'commands_disabled' });
	}
	const command = String(payload.command || payload.script || payload.text || '').trim();
	if (!command) {
		return Context.named(payload, 'commandStart', { ok: false, error: 'missing_command' });
	}
	await Context.GarbageCollection.collect(config);
	const ids = Context.Ids.commandIds();
	const cwd = Context.resolveCwd(config, payload);
	const shell = payload.shell || Context.Policy.defaultShell();
	const timeoutMs = Context.Policy.boundedTimeout(payload.timeoutMs || 86400000);
	const hash = Idempotency.commandHash({ command, cwd, shell, env: payload.env || {} });
	const keyed = Idempotency.begin({
		idempotencyKey: payload.idempotencyKey,
		commandHash: hash,
		jobId: ids.jobId
	});
	if (!keyed.ok) return Context.named(payload, 'commandStart', keyed);
	if (keyed.kind === 'coalesced') return coalesced(config, payload, keyed.record);
	await Context.Paths.ensureDir(config, ids.jobId);
	const meta = Context.MetaFactory.createMeta({
		...ids,
		command,
		cwd,
		shell,
		timeoutMs,
		config,
		payload,
		ids
	});
	meta.ownerId = Scheduler.ownerOf(payload);
	meta.commandHash = hash;
	meta.idempotencyKey = String(payload.idempotencyKey || '').trim() || undefined;
	meta.queue = { ownerId: meta.ownerId, queuedAt: new Date().toISOString() };
	await Context.Meta.write(config, ids.jobId, meta);
	const scheduled = await Scheduler.submit({
		jobId: ids.jobId,
		ownerId: meta.ownerId,
		launch: () => Launcher.launch(config, payload, meta),
		onLaunchError: error => Launcher.fail(config, meta, error)
	});
	if (!scheduled.ok) return rejectScheduled(config, payload, meta, scheduled);
	if (!scheduled.queued) return scheduled.result;
	const queuedMeta = {
		...meta,
		queue: {
			...meta.queue,
			queuePosition: scheduled.queuePosition,
			ownerQueued: scheduled.ownerQueued
		}
	};
	return Context.Responses.start(ids.jobId, { meta: queuedMeta, storage: meta.storage });
}

async function coalesced(config, payload, record) {
	const meta = await Context.Meta.read(config, record.jobId);
	if (!meta) {
		Idempotency.remove(record.idempotencyKey);
		return Context.named(payload, 'commandStart', {
			ok: false,
			error: 'idempotent_job_missing',
			status: 409
		});
	}
	return {
		...Context.Responses.start(meta.jobId, { meta, storage: meta.storage }),
		coalesced: true,
		idempotencyKey: record.idempotencyKey
	};
}

async function rejectScheduled(config, payload, meta, scheduled) {
	if (meta.idempotencyKey) Idempotency.remove(meta.idempotencyKey);
	const rejected = await Lifecycle.finalizeDetached(config, meta.jobId, meta, {
		status: 'rejected',
		error: scheduled.error,
		retryable: scheduled.retryable,
		retryAfterMs: scheduled.retryAfterMs
	});
	return Context.named(payload, 'commandStart', {
		...scheduled,
		jobId: meta.jobId,
		worker: rejected.worker,
		receipt: rejected.receipt
	});
}

module.exports = { coalesced, rejectScheduled, startCommandJob };
