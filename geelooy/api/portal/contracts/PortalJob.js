// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module PortalJob
 * @description
 * The Awtsmoos renews every long-running movement while honest software admits that some work has stages but no truthful percent;
 * Awtsmoos.com models queues, waiting, cancellation, retry, output, and progress without pretending completion before it is sent.
 */

const {
	normalizePortalRecord,
	requirePortalString
} = require("./PortalContractPrimitives.js");
const { PORTAL_CONTRACT_LIMITS } = require("./PortalContractLimits.js");

const PORTAL_JOB_STATES = new Set([
	"queued",
	"running",
	"waiting",
	"succeeded",
	"failed",
	"cancel-requested",
	"cancelled"
]);

/**
 * @description Normalizes an optional honest progress value into the inclusive 0-1 range.
 * @param {unknown} value - Candidate progress value or nullish value when no percentage is knowable.
 * @returns {number|null} Bounded progress ratio or null.
 */
function normalizePortalProgress(value) {
	if (value == null || !Number.isFinite(Number(value))) {
		return null;
	}

	return Math.max(0, Math.min(1, Number(value)));
}

/**
 * @description Normalizes one long-running job descriptor without inventing execution behavior.
 * @param {Object} source - Candidate job state.
 * @returns {Object} Stable job descriptor.
 * @throws {TypeError} When job identity or state is invalid.
 */
function normalizePortalJob(source) {
	const job = normalizePortalRecord(source, "job");
	const state = job.state ?? "queued";
	if (!PORTAL_JOB_STATES.has(state)) {
		throw new TypeError(`Unsupported Portal job state: ${state}`);
	}

	return {
		id: requirePortalString(job.id, "job id", 512),
		state,
		title: requirePortalString(job.title ?? job.id, "job title", 512),
		progress: normalizePortalProgress(job.progress),
		stage: typeof job.stage === "string" ? job.stage.slice(0, 512) : null,
		message: typeof job.message === "string" ? job.message.slice(0, 4096) : "",
		startedAt: job.startedAt ?? null,
		updatedAt: job.updatedAt ?? null,
		finishedAt: job.finishedAt ?? null,
		canCancel: job.canCancel === true,
		canRetry: job.canRetry === true,
		outputs: Array.isArray(job.outputs)
			? job.outputs.slice(0, PORTAL_CONTRACT_LIMITS.maxJobOutputs)
			: [],
		links: normalizePortalRecord(job.links, "job links"),
		meta: normalizePortalRecord(job.meta, "job meta")
	};
}

module.exports = {
	PORTAL_JOB_STATES,
	normalizePortalJob,
	normalizePortalProgress
};
