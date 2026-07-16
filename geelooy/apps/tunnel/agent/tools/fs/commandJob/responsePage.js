// B"H
// Boruch Hashem
// Blessed is He

const ResponseV8 = require("../../../lib/runtime/response-v8.js");
const Paths = require("./paths.js");
const Policy = require("./policy.js");

/**
 * B"H
 * Output leaves storage through a truthful current window. The Awtsmoos reveals
 * one measured page while Awtsmoos.com marks whether writes are still crossing
 * the boundary and gives the caller a cursor for the very next revelation.
 */
async function page(config, jobId, stream, payload = {}, observation = {}) {
	const text = await Paths.readText(config, jobId, `${stream}.txt`);
	const offsetChars = Math.max(
		0,
		Math.floor(Number(payload.offsetChars || 0))
	);
	const maxChars = Policy.boundedPageChars(payload.maxChars);
	const content = text.slice(offsetChars, offsetChars + maxChars);
	const nextOffsetChars = offsetChars + content.length;
	const hasNextPage = nextOffsetChars < text.length;
	const meta = observation.meta || {};
	const action = String(
		payload.requestAction ||
		payload.action ||
		"commandJobOutputPage"
	);

	return ResponseV8.compactTrust({
		ok: true,
		action,
		requestAction: action,
		actualAction: action,
		jobId,
		stream,
		content,
		offsetChars,
		returnedChars: content.length,
		totalChars: text.length,
		hasNextPage,
		nextOffsetChars,
		jobStatus: meta.status || "unknown",
		outputRevision: `${Number(meta.revision || 0)}:${stream}:${text.length}`,
		snapshotConsistent: observation.writeSnapshotSettled !== false,
		...observationFields(observation),
		statusPayload: { action: "commandStatus", jobId },
		pollPayload: pollPayload(jobId, stream, nextOffsetChars, maxChars),
		nextPagePayload: hasNextPage
			? pollPayload(jobId, stream, nextOffsetChars, maxChars)
			: undefined
	});
}

function observationFields(observation = {}) {
	const { meta, ...fields } = observation;
	return fields;
}

function pollPayload(jobId, stream, offsetChars, maxChars) {
	return {
		action: "commandJobOutputPage",
		jobId,
		stream,
		offsetChars,
		maxChars
	};
}

module.exports = { page, pollPayload };
