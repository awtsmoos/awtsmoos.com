// B"H
// Boruch Hashem
// Blessed is He

const Context = require("./context.js");
const Idempotency = require("./idempotency.js");
const Lifecycle = require("./lifecycle.js");

/**
 * @file Builds truthful command-start results without tying caller latency to process birth.
 * @description
 * The Awtsmoos lets intention receive a durable name before the child takes breath.
 * Awtsmoos.com returns that job identity immediately, while later launch, failure,
 * output, and completion remain observable through the job's own persistent vessels.
 */
function starting(payload, meta, scheduled = {}) {
	return {
		...Context.Responses.start(meta.jobId, {
			meta: {
				...meta,
				queue: {
					...meta.queue,
					queued: false,
					starting: true
				}
			},
			storage: meta.storage
		}),
		starting: true,
		queued: false,
		ownerId: scheduled.ownerId || meta.ownerId
	};
}

/** Returns the existing durable job for an identical idempotency key. */
async function coalesced(config, payload, record) {
	const meta = await Context.Meta.read(config, record.jobId);
	if (!meta) {
		Idempotency.remove(record.idempotencyKey);
		return Context.named(payload, "commandStart", {
			ok: false,
			error: "idempotent_job_missing",
			status: 409
		});
	}
	return {
		...Context.Responses.start(meta.jobId, {
			meta,
			storage: meta.storage
		}),
		coalesced: true,
		idempotencyKey: record.idempotencyKey
	};
}

/** Persists a scheduler rejection as the terminal state of a never-started job. */
async function rejected(config, payload, meta, scheduled) {
	if (meta.idempotencyKey) Idempotency.remove(meta.idempotencyKey);
	const finalized = await Lifecycle.finalizeDetached(
		config,
		meta.jobId,
		meta,
		{
			status: "rejected",
			error: scheduled.error,
			retryable: scheduled.retryable,
			retryAfterMs: scheduled.retryAfterMs
		}
	);
	return Context.named(payload, "commandStart", {
		...scheduled,
		jobId: meta.jobId,
		worker: finalized.worker,
		receipt: finalized.receipt
	});
}

module.exports = {
	coalesced,
	rejected,
	starting
};
