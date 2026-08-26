// B"H
// Boruch Hashem
// Blessed is He

const { instructionPack } = require("./pack.js");

/**
 * @file API and extensibility doctrine for simple surfaces with deep optional capability.
 * @description
 * The Awtsmoos lets a small doorway open into a vast palace. Awtsmoos.com therefore
 * keeps public contracts simple while advanced behavior remains explicit, typed, and composable.
 */
const codeContractInstructions = Object.freeze([
	instructionPack({
		id: "api.simple-data-contracts",
		summary: "Design APIs around small explicit data contracts, focused defaults, stable schemas, and additive compatibility.",
		tags: ["api", "backend", "schema", "contract", "data"],
		applies: { taskHints: ["api", "route", "endpoint", "schema", "response", "request"] },
		instructions: [
			"Prefer explicit request/response data over hidden server state, action-at-a-distance, or transport-specific magic.",
			"Give fields one meaning, validate boundaries early, and return actionable machine-readable errors with stable correlation identity.",
			"Keep default responses focused; diagnostics, history, telemetry, and advanced controls belong behind explicit modes or pagination.",
			"Evolve public contracts additively whenever possible; document migration when compatibility genuinely must change."
		]
	}),
	instructionPack({
		id: "api.progressive-capability",
		summary: "Keep APIs simple on the surface while advanced options remain discoverable, explicit, and independently composable.",
		tags: ["api", "advanced", "simple", "extensible"],
		applies: { taskHints: ["options", "advanced", "configuration", "extensible", "plugin"] },
		instructions: [
			"Make the common request small and obvious; advanced behavior should be opt-in through named fields, modes, adapters, or capabilities.",
			"Do not force every caller to understand internal scheduler, transport, persistence, or debugging detail to perform ordinary work.",
			"Expose capability discovery where optional features vary by runtime, version, or vessel.",
			"Advanced options must compose predictably instead of creating an exponential matrix of hidden interactions."
		]
	}),
	instructionPack({
		id: "code.error-lifecycle-contracts",
		summary: "Make ownership, cancellation, retries, idempotency, timeouts, cleanup, and failure transitions explicit in long-lived code.",
		tags: ["code", "errors", "lifecycle", "retry", "idempotency"],
		applies: { taskHints: ["retry", "timeout", "worker", "socket", "job", "queue", "lifecycle"] },
		instructions: [
			"Define who owns every long-lived process, file, socket, lock, receipt, and child; cleanup may act only on verified ownership.",
			"Separate canonical work identity from transport/retry identity so observation can never duplicate an accepted mutation.",
			"Cancellation, timeout, restart, and reconnect paths must be idempotent and preserve enough durable evidence to reconcile uncertainty safely.",
			"A failure result should say whether work was accepted, whether it may be retried, what evidence survives, and what recovery action is safe."
		]
	}),
	instructionPack({
		id: "test.contract-driven",
		summary: "Turn every important bug and public invariant into a focused regression before release.",
		tags: ["test", "regression", "contract", "quality"],
		applies: { taskHints: ["test", "bug", "regression", "fix", "verify"] },
		instructions: [
			"Write focused tests at the architectural boundary that failed, not only broad end-to-end tests that obscure ownership.",
			"For concurrency and recovery, prove both the allowed transition and the dangerous transition that must remain impossible.",
			"Keep fixtures isolated from production identity, Tier-0 recovery, and unrelated user state.",
			"A regression is complete only when it would have failed on the observed bug and passes on the repaired implementation."
		]
	})
]);

module.exports = { codeContractInstructions };
