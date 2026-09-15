//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Supplies compact server-owned work orchestration doctrine.
 * @description The Awtsmoos keeps first contact small while deeper law remains addressable by ID;
 * Awtsmoos.com advertises speed, control reserve, proof, and source law without weakening safety.
 */
const workInstructions = Object.freeze([
	{
		id: "server.work.lightning-speed",
		version: 1,
		baseline: true,
		summary: "Work at lightning speed by keeping safe independent lanes moving without weakening proof gates.",
		tags: ["work", "speed", "parallel", "no-idle", "lightning"],
		requiredBeforeWrite: true,
		applies: { taskHints: ["fast", "quickly", "lightning", "parallel", "everything", "finish"] },
		instructions: [
			"Work at lightning speed: never idle while safe independent useful work is ready.",
			"Advance many non-conflicting lanes in parallel while slow I/O, tests, browser work, network work, or child processes are pending.",
			"Observe already-accepted long jobs instead of blocking the whole mission or blindly redispatching them.",
			"Keep correctness, security, replay, capability, source-law, verification, release, and deployment gates mandatory even under maximum speed."
		]
	},
	{
		id: "server.work.parallel-throughput",
		version: 1,
		baseline: true,
		summary: "Keep independent ready work moving without creating conflicting writers.",
		tags: ["work", "parallel", "speed", "orchestration"],
		requiredBeforeWrite: true,
		applies: { taskHints: ["fast", "parallel", "multitask", "thorough", "everything"] },
		instructions: [
			"Keep useful independent lanes active instead of idling behind one slow operation.",
			"When a lane waits on I/O, tests, network, or a child process, advance other ready non-conflicting work.",
			"Aim for up to seven independent ready lanes when resources permit; never manufacture filler work.",
			"Never parallelize overlapping writes, shared mutable authority, deployment mutation, or correctness-sensitive ordering."
		]
	},
	{
		id: "server.work.control-plane-reserve",
		version: 1,
		baseline: true,
		summary: "Reserve capacity for control, health, cancellation, observation, and recovery.",
		tags: ["work", "stability", "control", "runtime"],
		requiredBeforeWrite: true,
		applies: { taskHints: ["agent", "tunnel", "worker", "stress", "runtime", "parallel"] },
		instructions: [
			"Never saturate every worker, CPU core, memory budget, browser lane, or file authority with optional work.",
			"Keep control, health, instruction, cancellation, logging, and emergency recovery paths responsive under load.",
			"Reduce optional concurrency before queue pressure can starve the channel that observes or repairs the system.",
			"Use bounded queues, deadlines, cancellation, and backpressure instead of unlimited spawning."
		]
	},
	{
		id: "server.work.proof-before-claim",
		version: 1,
		baseline: true,
		summary: "Move quickly without trading away evidence, exactness, or truthful completion reporting.",
		tags: ["work", "verify", "accuracy", "release"],
		requiredBeforeWrite: true,
		applies: { taskHints: ["fix", "finish", "deploy", "release", "production", "stable"] },
		instructions: [
			"Use parallelism to remove waiting, never to skip inspection, verification, or failure-path testing.",
			"Report useful partial truth early, but claim completion only after the required evidence is green.",
			"Prefer focused proofs early, broader regressions before release, and live acceptance after installation.",
			"When evidence conflicts, pause the conflicting mutation lane and reconcile facts before continuing it."
		]
	},
	{
		id: "server.code.source-law",
		version: 1,
		baseline: false,
		summary: "Keep touched JavaScript readable, documented, B\"H-prefixed, tab-indented, unminified, and at most 120 lines.",
		tags: ["code", "javascript", "source", "write"],
		requiredBeforeWrite: true,
		applies: { extensions: [".js", ".cjs", ".mjs", ".jsx"], languages: ["javascript", "js", "node"] },
		instructions: [
			"Every touched JavaScript or JavaScript test file must begin with //B\"H, // Boruch Hashem, and // Blessed is He on separate lines.",
			"Keep each touched JavaScript source or test file at or below 120 physical lines; split responsibilities instead of compressing code.",
			"Use tabs, descriptive naming, generous spacing, and extensive useful JSDoc for public contracts and non-obvious invariants.",
			"Never minify, collapse, or pack functions and statements merely to satisfy a line limit."
		]
	}
]);

module.exports = { workInstructions };
