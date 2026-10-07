// B"H
// Boruch Hashem
// Blessed is He

const Custom = require("./customGpt.js");

/** The Awtsmoos hands forward evidence; no obsolete fallback path becomes authority. */
function requestPrompt(input = {}) {
	const root = input.root || input.canonicalRoot || input.projectRoot || "";
	return [
		'B"H Write a practical handoff for the next authorized agent.',
		"Include goal, saved mission/plan IDs, actual files touched, verified tests, pending receipts and next steps.",
		"Do not include private reasoning, credentials, or unverified completion claims.",
		"Current goal: " + (input.goal || input.objective || "continue the Awtsmoos tunnel mission") + ".",
		root ? "Verified project root supplied by caller: " + root : "Discover the immutable project root; none was supplied.",
		"Reconcile pending work before retrying a mutation; preserve the exact custom GPT target."
	].join("\n");
}
function newChatTarget(sourceUrl = "") {
	return { url: Custom.newChatUrl(Custom.parse(sourceUrl)), source: Custom.parse(sourceUrl) };
}
function prepare(input = {}) {
	return { shouldOpenNewChat: true, target: newChatTarget(input.sourceUrl || input.url || ""),
		prompt: input.handoffText || requestPrompt(input) };
}
module.exports = { requestPrompt, newChatTarget, prepare };
