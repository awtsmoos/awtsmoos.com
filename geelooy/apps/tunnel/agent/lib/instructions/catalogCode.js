// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file JavaScript and API architecture doctrine for beautiful internal machinery.
 * @description
 * The Awtsmoos is not served by clever fog. Awtsmoos.com demands code whose
 * structure can be read like architecture: explicit responsibilities, contracts, and expansion seams.
 */
const codeInstructions = Object.freeze([
	pack("code.javascript-architecture", "Make JavaScript modular, data-driven, explicit, testable, and class-oriented only where real stateful abstractions justify classes.", ["javascript", "js", "code", "refactor"], [
		"Separate policy, data, orchestration, transport, rendering, persistence, and side effects instead of letting one module become a hidden application.",
		"Prefer data tables and explicit registries over sprawling conditional ladders when behavior is naturally declarative.",
		"Use classes, extends, composition, factories, or plain functions according to the actual domain; never create ornamental inheritance merely to look advanced.",
		"Expose narrow stable public APIs and keep mutable implementation details private behind focused modules.",
		"Make error states, cancellation, retries, idempotency, ownership, and lifecycle boundaries explicit rather than implicit side effects."
	]),
	pack("code.modularity-120", "Keep source files at or below 120 lines by splitting responsibilities, never by compressing code, comments, or readability.", ["javascript", "code", "refactor", "write"], [
		"When a source file approaches 120 lines, extract cohesive policy, data, adapters, renderers, validators, or lifecycle helpers into named modules.",
		"Never satisfy the limit with minification, multiple statements crammed onto one line, anonymous mega-expressions, or deleted documentation.",
		"Prefer a directory of small obvious modules over a single file that requires scrolling to understand unrelated responsibilities.",
		"Keep imports and exports explicit so dependency direction remains visible and circular coupling is easy to detect."
	]),
	pack("code.naming-documentation", "Give every function/class substantial JSDoc and technically meaningful names; use Torah/Kabbalah metaphors only when they clarify architecture.", ["javascript", "code", "docs"], [
		"Every meaningful function, class, public method, and non-obvious module requires JSDoc describing responsibility, inputs, outputs, side effects, failure behavior, and architectural role.",
		"File-level commentary is not a substitute for per-function documentation; local behavior must remain understandable where it is defined.",
		"Choose precise domain names first. A Torah or Kabbalah-inspired term is welcome when its metaphor genuinely maps to responsibility and is explained in the JSDoc.",
		"Never force mystical naming onto mundane variables if it would make debugging, onboarding, logs, or API contracts harder to understand.",
		"Keep implementation visually beautiful: tabs, deliberate whitespace, short blocks, explicit data shapes, and no compressed one-line functions."
	]),
	pack("api.simple-data-contracts", "Design APIs around small explicit data contracts, stable schemas, focused errors, and additive compatibility.", ["api", "backend", "javascript", "contract"], [
		"Prefer simple request/response data over hidden server state, action-at-a-distance, or transport-specific magic.",
		"Give fields one meaning, document required/optional behavior, validate boundaries early, and return actionable machine-readable errors.",
		"Keep default responses focused; large diagnostics, histories, telemetry, and raw internals belong behind explicit modes or pagination.",
		"Evolve public contracts additively whenever possible; if compatibility must change, provide an explicit migration or version boundary.",
		"Make idempotency, pagination, cancellation, retries, timeouts, and correlation identities first-class when the operation can outlive one request."
	])
]);

/**
 * Freezes one internal-code doctrine record so summary and full law stay version-aligned.
 *
 * @param {string} id Stable instruction ID.
 * @param {string} summary One-sentence compact guidance.
 * @param {string[]} tags Task-resolution tags.
 * @param {string[]} instructions Full architecture doctrine.
 * @returns {object} Immutable instruction record.
 */
function pack(id, summary, tags, instructions) {
	return Object.freeze({ id, version: 1, summary, tags, requiredBeforeWrite: true, instructions });
}

module.exports = { codeInstructions };
