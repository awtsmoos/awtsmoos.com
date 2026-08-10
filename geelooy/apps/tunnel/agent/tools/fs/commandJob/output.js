// B"H
// Boruch Hashem
// Blessed is He

const Context = require("./context.js");
const Locator = require("./jobLocator.js");
const PollingGuidance = require("./pollingGuidance.js");
const WriteSnapshot = require("./writeSnapshot.js");

/**
 * @file Reads command output from the exact durable room that owns the job ID.
 * @description
 * The Awtsmoos lets output survive a project-root crossing. Awtsmoos.com observes
 * pending writes in memory, then reads bytes and metadata through one located config.
 */
async function commandJobOutputPage(config = {}, payload = {}) {
	const jobId = Context.Policy.cleanId(payload.jobId || payload.id || "");
	if (!jobId) return missing(payload, "missing_jobId");
	const located = await Locator.locate(config, jobId);
	if (!located.ok) return missing(payload, located.error, jobId, located);
	const stream = String(payload.stream || "stdout").toLowerCase() === "stderr"
		? "stderr"
		: "stdout";
	const snapshot = await WriteSnapshot.observe(
		jobId,
		Context.activeJobs,
		payload
	);
	const meta = await Context.Meta.read(located.config, jobId) || located.meta;
	const guidance = PollingGuidance.forJob(meta, snapshot);
	const response = await Context.Responses.page(
		located.config,
		jobId,
		stream,
		payload,
		{ ...snapshot, ...guidance, meta }
	);
	return {
		...response,
		resolvedStateRoot: located.stateRoot,
		crossRootResolved: located.current !== true
	};
}

function missing(payload, error, jobId, located = {}) {
	return Context.named(payload, "commandJobOutputPage", {
		ok: false,
		error,
		jobId,
		matches: located.matches,
		searchedRoots: located.searchedRoots
	});
}

module.exports = { commandJobOutputPage };
