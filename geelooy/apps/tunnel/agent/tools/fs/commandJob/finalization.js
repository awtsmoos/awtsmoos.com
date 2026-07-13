// B"H
// Boruch Hashem
// Blessed is He

const Context = require("./context.js");
const GarbageCadence = require("./gcCadence.js");
const Idempotency = require("./idempotency.js");
const Scheduler = require("./scheduler.js");

/**
 * B"H
 * Every terminal cause enters one promise before it changes the process. The
 * Awtsmoos lets cleanup breathe through one shared cadence, so a thousand
 * completed workers do not summon a thousand recursive filesystem scans.
 */
function reserve(config, jobId, live, producer) {
	if (live.finalizing) return live.finalizing;
	live.finalizing = Promise.resolve()
		.then(producer)
		.catch(error => ({
			status: "failed",
			error: error.message
		}))
		.then(patch => finalizeLive(config, jobId, live, patch));
	return live.finalizing;
}

async function finalizeLive(config, jobId, live, patch = {}) {
	if (live.timer) clearTimeout(live.timer);
	Context.Heartbeat.stop(live);
	await Promise.resolve(live.identityPromise).catch(() => null);
	await Context.IO.waitForWrites(jobId, Context.activeJobs);
	const current = await Context.Meta.read(config, jobId);
	const base = current && Context.Policy.TERMINAL.has(current.status)
		? current
		: {
			...live.meta,
			...(current || {})
		};
	const finalMeta = Context.Policy.TERMINAL.has(base.status)
		? base
		: Context.Finalize.finalizeMeta({
			...base,
			...patch,
			finishedAt: new Date().toISOString()
		});
	const counted = await Context.refreshCounts(config, jobId, finalMeta);
	const saved = await Context.Meta.write(config, jobId, counted);
	Context.RegistryBridge.finishRegistry(live.registry, saved);
	Context.activeJobs.delete(jobId);
	completeOwnership(saved);
	void GarbageCadence.collect(config).catch(() => {});
	return saved;
}

async function finalizeDetached(config, jobId, meta, patch = {}) {
	const finalMeta = Context.Finalize.finalizeMeta({
		...meta,
		...patch,
		finishedAt: new Date().toISOString()
	});
	const counted = await Context.refreshCounts(config, jobId, finalMeta);
	const saved = await Context.Meta.write(config, jobId, counted);
	completeOwnership(saved);
	return saved;
}

function completeOwnership(meta = {}) {
	Scheduler.finish(meta.jobId);
	if (meta.idempotencyKey) {
		Idempotency.update(meta.idempotencyKey, {
			state: meta.status,
			jobId: meta.jobId,
			finishedAt: meta.finishedAt
		});
	}
}

function cleanupOptions() {
	return {
		graceMs: Number(
			process.env.AWTSMOOS_COMMAND_CANCEL_GRACE_MS ||
			500
		),
		pollMs: Number(
			process.env.AWTSMOOS_COMMAND_CANCEL_POLL_MS ||
			25
		)
	};
}

module.exports = {
	cleanupOptions,
	completeOwnership,
	finalizeDetached,
	finalizeLive,
	reserve
};
