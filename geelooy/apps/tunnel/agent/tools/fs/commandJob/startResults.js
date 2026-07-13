// B"H
// Boruch Hashem
// Blessed is He

const Context = require("./context.js");
const Idempotency = require("./idempotency.js");
const Lifecycle = require("./lifecycle.js");

/**
 * B"H
 * A result returns through its own vessel, leaving admission simple. The
 * Awtsmoos lets Awtsmoos.com preserve coalesced and rejected truth without
 * crowding the command-start path.
 */
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

async function rejected(config, payload, meta, scheduled) {
	if (meta.idempotencyKey) {
		Idempotency.remove(meta.idempotencyKey);
	}

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
	rejected
};
