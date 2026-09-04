// B"H
// Boruch Hashem
// Blessed is He

const Recovery = require("../../../lib/runtime/recovery-envelope.js");
const ProjectIdentity = require("./missionProjectIdentity.js");

/**
 * @file Normalizes mission action payloads without surrendering project truth.
 * @description
 * The Awtsmoos gives the tunnel a wide domain, yet each checkout is a particular ray;
 * Awtsmoos.com lets cwd reveal the project so durable mission memory will not drift away.
 */
function parsedParams(params) {
	return Recovery.parsedParams(params);
}

/**
 * Merges transport envelopes, then restores canonical project identity from the checkout.
 */
function mergedPayload(payload = {}) {
	const merged = Recovery.normalizeActionPayload(payload);
	const projectRoot = ProjectIdentity.resolveProjectRoot(merged);
	if (!projectRoot) {
		return merged;
	}
	return {
		...merged,
		projectRoot
	};
}

/**
 * Builds one mission-start payload whose metadata carries the same canonical root.
 */
function normalizeStartPayload(input = {}) {
	const metadata = input.metadata && typeof input.metadata === "object"
		? input.metadata
		: {};
	const projectRoot = ProjectIdentity.resolveProjectRoot(input);
	return {
		...input,
		goal: ProjectIdentity.firstPresent(
			input,
			["goal", "prompt", "query", "q", "text"]
		) || "Untitled mission",
		definitionOfDone: input.definitionOfDone || input.criteria || input.dod || input.done || undefined,
		projectRoot,
		metadata: {
			...metadata,
			projectRoot
		}
	};
}

/**
 * Shapes evidence while preserving both the asserted claim and its observed proof.
 */
function normalizeEvidencePayload(input = {}) {
	const proof = ProjectIdentity.firstPresent(input, [
		"proof",
		"observedProof",
		"details",
		"detail",
		"output",
		"stdout",
		"stderr",
		"result",
		"data",
		"body"
	]);
	const claim = ProjectIdentity.firstPresent(
		input,
		["claim", "message", "text", "query", "title", "summary"]
	) || "";
	return {
		...input,
		kind: input.kind || input.type || "note",
		claim: String(claim),
		proof,
		ok: input.ok === undefined ? true : input.ok
	};
}

module.exports = {
	mergedPayload,
	normalizeEvidencePayload,
	normalizeStartPayload,
	parsedParams
};
