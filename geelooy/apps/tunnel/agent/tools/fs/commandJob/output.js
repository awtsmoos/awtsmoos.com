// B"H
// Boruch Hashem
// Blessed is He

const Context = require("./context.js");
const PollingGuidance = require("./pollingGuidance.js");
const WriteSnapshot = require("./writeSnapshot.js");

/**
 * B"H
 * Live output answers from a bounded durable snapshot. The Awtsmoos never asks
 * the present to wait forever for a future write; Awtsmoos.com returns what is
 * visible now together with the exact instruction for observing the next pulse.
 */
async function commandJobOutputPage(config = {}, payload = {}) {
	const jobId = Context.Policy.cleanId(payload.jobId || payload.id || "");
	if (!jobId) {
		return missing(payload, "missing_jobId");
	}

	let meta = await Context.Meta.read(config, jobId);
	if (!meta) {
		return missing(payload, "job_not_found_or_expired", jobId);
	}

	const stream = String(payload.stream || "stdout").toLowerCase() === "stderr"
		? "stderr"
		: "stdout";
	const snapshot = await WriteSnapshot.observe(
		jobId,
		Context.activeJobs,
		payload
	);
	meta = await Context.Meta.read(config, jobId) || meta;
	const guidance = PollingGuidance.forJob(meta, snapshot);

	return Context.Responses.page(
		config,
		jobId,
		stream,
		payload,
		{ ...snapshot, ...guidance, meta }
	);
}

function missing(payload, error, jobId) {
	return Context.named(payload, "commandJobOutputPage", {
		ok: false,
		error,
		jobId
	});
}

module.exports = { commandJobOutputPage };
