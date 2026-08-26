// B"H
// Boruch Hashem
// Blessed is He

const { instructionPack } = require("./pack.js");

/**
 * @file Documentation doctrine for discoverability, emergencies, examples, and handoff.
 * @description
 * The Awtsmoos lets knowledge remain available even when the original builder is absent.
 * Awtsmoos.com therefore treats docs as an operational interface, not an afterthought.
 */
const documentationInstructions = Object.freeze([
	instructionPack({
		id: "docs.discoverability",
		summary: "Document features where another human or AI can find the right workflow quickly from names, IDs, examples, and cross-links.",
		tags: ["docs", "discoverability", "handoff"],
		applies: { extensions: [".md", ".mdx", ".txt"], taskHints: ["docs", "readme", "guide", "instructions"] },
		instructions: [
			"Lead with what the feature is, when to use it, the smallest working example, and the canonical action/file identifiers.",
			"Cross-link related recovery, compatibility, API, and troubleshooting paths instead of forcing readers to rediscover terminology.",
			"Keep machine-discoverable names and human explanations aligned so an AI can search the exact phrase visible in errors or responses.",
			"Update documentation in the same change that alters public behavior or repair procedure."
		]
	}),
	instructionPack({
		id: "docs.emergency-handoff",
		summary: "Make emergency recovery paths immediately discoverable, independent, ordered, and safe for another agent to execute.",
		tags: ["docs", "emergency", "recovery", "tunnel"],
		applies: { taskHints: ["emergency", "recovery", "tunnel", "installer", "supervisor"] },
		instructions: [
			"Document the normal repair path, sealed emergency path, browser/virtual fallback, exact health evidence, and stop conditions in priority order.",
			"State which recovery lane is independent of which failed subsystem; emergency instructions must not secretly depend on the component they repair.",
			"Include identity-preservation and ownership-verification rules so recovery cannot create duplicate tunnels or kill unrelated processes.",
			"Write error names and action IDs verbatim so another AI can search source and history immediately."
		]
	}),
	instructionPack({
		id: "docs.examples-contracts",
		summary: "Use realistic examples that show normal, advanced, failure, and compatibility behavior without hiding important constraints.",
		tags: ["docs", "examples", "api", "contracts"],
		applies: { taskHints: ["example", "api", "schema", "migration", "compatibility"] },
		instructions: [
			"Show the smallest normal request first, then advanced options, then one representative failure/recovery example.",
			"Examples must use real action names, field shapes, and response semantics rather than aspirational pseudocode that the implementation does not support.",
			"Call out idempotency, retries, destructive effects, authentication, and compatibility when those properties affect safe use.",
			"Keep examples short enough to copy while linking to deeper reference material for exhaustive fields."
		]
	})
]);

module.exports = { documentationInstructions };
