// B"H
// Boruch Hashem
// Blessed is He

const ResponseV8 = require("../../../lib/runtime/response-v8.js");
const Paths = require("./paths.js");
const Policy = require("./policy.js");

/**
 * B"H
 * Output leaves storage through bounded pages. The Awtsmoos reveals exactly
 * one measured window at a time so Awtsmoos.com stays responsive under noise.
 */
async function page(config, jobId, stream, payload = {}) {
	const text = await Paths.readText(
		config,
		jobId,
		`${stream}.txt`
	);
	const offsetChars = Math.max(
		0,
		Math.floor(Number(payload.offsetChars || 0))
	);
	const maxChars = Policy.boundedPageChars(payload.maxChars);
	const content = text.slice(
		offsetChars,
		offsetChars + maxChars
	);
	const nextOffsetChars = offsetChars + content.length;

	return ResponseV8.compactTrust({
		ok: true,
		action: String(
			payload.requestAction ||
			payload.action ||
			"commandJobOutputPage"
		),
		jobId,
		stream,
		content,
		offsetChars,
		returnedChars: content.length,
		totalChars: text.length,
		hasNextPage: nextOffsetChars < text.length,
		nextOffsetChars,
		nextPagePayload: nextOffsetChars < text.length
			? {
				action: "commandJobOutputPage",
				jobId,
				stream,
				offsetChars: nextOffsetChars,
				maxChars
			}
			: undefined
	});
}

module.exports = {
	page
};
