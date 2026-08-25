// B"H
// Boruch Hashem
// Blessed is He

const { instructionPack } = require("./pack.js");

/**
 * @file Core execution doctrine for every source-changing shliach.
 * @description
 * The Awtsmoos renews intention before manifestation; Awtsmoos.com requires inspection,
 * coherent whole-file custody, continuous improvement, proof, and safe recovery before completion.
 */
const coreInstructions = Object.freeze([
	instructionPack({
		id: "work.inspect-before-write",
		summary: "Inspect real files, callers, contracts, tests, runtime evidence, and current state before changing anything.",
		tags: ["work", "write", "debug", "refactor"],
		applies: { modes: ["write", "edit", "refactor", "fix"] },
		instructions: [
			"Read the complete target and its real callers before writing; filenames, memory, and conventions are not evidence.",
			"Trace imports, exports, routes, schemas, tests, side effects, runtime receipts, and public compatibility surfaces touched by the task.",
			"Separate verified facts from hypotheses and refresh important claims from current files or live runtime evidence.",
			"List the complete files and invariants that must survive before the first source write."
		]
	}),
	instructionPack({
		id: "work.whole-file-rewrites",
		summary: "Rewrite every modified source file as one coherent complete file; never perform fragment surgery.",
		tags: ["work", "write", "refactor"],
		applies: { modes: ["write", "edit", "replace", "append"] },
		instructions: [
			"Read the full file, then rewrite the complete file so imports, docs, names, formatting, and architecture remain coherent.",
			"Never use partial textual insertion/replacement as the implementation strategy for human-authored source.",
			"Preserve unrelated behavior deliberately; whole-file custody is not permission to erase contracts you did not inspect.",
			"If the file is too large, split real responsibilities into smaller modules instead of compressing comments or logic."
		]
	}),
	instructionPack({
		id: "craft.continuous-improvement",
		summary: "Treat the first acceptable result as a baseline and keep improving every safely relevant surface.",
		tags: ["work", "quality", "ui", "api", "refactor"],
		applies: { taskHints: ["improve", "better", "polish", "clean", "upgrade"] },
		instructions: [
			"Do not stop because the named defect barely disappeared; inspect the surrounding experience for directly related weaknesses.",
			"Improve clarity, resilience, performance, accessibility, maintainability, documentation, and polish wherever the same evidence supports it safely.",
			"Work faster by removing redundant exploration and batching independent verification, never by skipping inspection or proof.",
			"Prefer durable foundations that make future expansion easier instead of one-off fixes that create the next repair burden."
		]
	}),
	instructionPack({
		id: "work.verify-beyond-request",
		summary: "Re-read every touched file and verify behavior, contracts, edge cases, regressions, and deployment evidence before completion.",
		tags: ["work", "test", "verify", "deploy"],
		applies: { modes: ["write", "edit", "deploy", "release"] },
		instructions: [
			"Run syntax, focused regression, integration, build, and release checks appropriate to the changed surface.",
			"Re-read every written file after tests and compare the actual implementation against the planned invariants.",
			"Verify failure paths and compatibility, not only the happy path.",
			"Never report deployment success until deployed bytes, version, runtime health, and live behavior are independently witnessed."
		]
	}),
	instructionPack({
		id: "stability.safe-execution",
		summary: "Protect control and recovery capacity; degrade noncritical work before risking the channel needed to repair the system.",
		tags: ["stability", "runtime", "test", "deploy", "tunnel"],
		applies: { taskHints: ["tunnel", "worker", "runtime", "stability", "recovery", "stress"] },
		instructions: [
			"Keep control, health, wait, observation, instruction, and emergency paths routable while bulk/heavy work is under pressure.",
			"Prefer bounded admission, backoff, cancellation, exact-root reaping, and corroborated repair over broad process killing.",
			"Treat stale telemetry as unknown unless independent evidence proves failure; never let one stale clock execute a living parent.",
			"A recovery mechanism is complete only when it cannot destroy the control channel required to repair its own failure."
		]
	}),
	instructionPack({
		id: "scope.geelooy-total-quality",
		summary: "Whenever touching geelooy, improve the directly related page, code, API, documentation, and recovery experience as one coherent product.",
		tags: ["geelooy", "quality", "product"],
		applies: { pathHints: ["/geelooy/", "geelooy/"] },
		instructions: [
			"Treat visible UI, internal code, API contracts, docs, failure states, and maintenance ergonomics as one quality surface.",
			"Inspect adjacent directly related pages/modules for safe improvements rather than polishing one selector or function in isolation.",
			"Keep simple workflows simple while making advanced capability progressively discoverable and expandable.",
			"Do not expand into unrelated risky subsystems merely to satisfy breadth; improve what the current evidence connects to the task."
		]
	})
]);

module.exports = { coreInstructions };
