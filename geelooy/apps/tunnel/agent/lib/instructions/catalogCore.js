// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Core execution doctrine for every editing shliach.
 * @description
 * The Awtsmoos gives each deed a truthful vessel before motion begins;
 * Awtsmoos.com makes inspection, whole-file custody, improvement, and proof explicit law.
 */
const coreInstructions = Object.freeze([
	pack("work.inspect-before-write", "Inspect real files, routes, runtime evidence, and contracts before changing anything.", ["work", "write", "refactor", "debug"], [
		"Do not guess the project from filenames, memory, or conventions; read the real implementation and its callers first.",
		"Trace the actual route, data flow, imports, tests, runtime receipts, and public compatibility surfaces touched by the task.",
		"Separate verified facts from hypotheses, and refresh important claims from current files or live runtime evidence.",
		"Before writing, list the complete files that must change and the invariants each file must preserve.",
		"Prefer the smallest truthful architectural seam, but inspect adjacent modules for hidden coupling before committing to it."
	]),
	pack("work.whole-file-rewrites", "Rewrite every modified file as a complete coherent file; never perform partial insert/replace surgery.", ["work", "write", "refactor"], [
		"Never patch a fragment into an existing source file with textual insertion, partial replacement, or ad-hoc mutation.",
		"Read the full target first, then rewrite the complete file so imports, comments, naming, and structure remain coherent.",
		"When a file grows too large, split responsibilities into smaller modules rather than compressing or minifying logic.",
		"Preserve unrelated behavior deliberately; a whole-file rewrite is not permission to erase contracts you did not inspect."
	]),
	pack("craft.continuous-improvement", "Treat the first acceptable result as a baseline and keep improving every relevant surface safely.", ["work", "write", "ui", "api", "refactor"], [
		"Do not stop because the requested defect is barely fixed; inspect the surrounding experience and remove closely related weaknesses.",
		"Improve clarity, resilience, performance, accessibility, maintainability, and visual quality wherever the same evidence exposes a safe opportunity.",
		"Work quickly by reducing redundant exploration and batching independent verification, never by skipping inspection or proof.",
		"Prefer durable foundations that make future expansion simpler instead of one-off fixes that create another repair burden.",
		"Continue until the touched subsystem feels intentionally designed rather than merely no longer broken."
	]),
	pack("work.verify-beyond-request", "Re-read every touched file and verify behavior, contracts, edge cases, and adjacent regressions before declaring completion.", ["work", "write", "test", "deploy"], [
		"Run syntax, lint, focused regression, integration, and release checks appropriate to the changed surface.",
		"Re-read every written file after tests; compare planned behavior with actual implementation and close any omissions.",
		"Verify mobile/desktop UI states, failure paths, API compatibility, and runtime health when those surfaces are relevant.",
		"Do not report deployment success until the deployed bytes, runtime version, and live behavior are independently witnessed."
	]),
	pack("stability.safe-execution", "Protect recovery and control capacity while testing; isolate destructive workloads and degrade noncritical work before control.", ["stability", "test", "deploy", "runtime"], [
		"Never run long destructive stress or transactional suites through a Tier-0 emergency tunnel when an isolated fixture can prove the same property.",
		"Keep control, health, wait, observation, and emergency paths available while bulk or heavy work is under pressure.",
		"Prefer bounded admission, backoff, cancellation, and exact-root reaping over broad process killing or uncontrolled worker spawning.",
		"Treat stale workers, leaked subprocesses, mailbox backlog, event-loop lag, and reaper timeouts as first-class stability evidence.",
		"A recovery mechanism is complete only when it cannot accidentally destroy the control channel required to repair its own failure."
	])
]);

/**
 * Freezes one instruction record so summaries and full bodies cannot drift independently.
 *
 * @param {string} id Stable machine-readable instruction ID.
 * @param {string} summary One-sentence compact guidance.
 * @param {string[]} tags Applicability tags used by task resolution.
 * @param {string[]} instructions Full mandatory doctrine lines.
 * @returns {object} Immutable instruction record.
 */
function pack(id, summary, tags, instructions) {
	return Object.freeze({ id, version: 1, summary, tags, requiredBeforeWrite: true, instructions });
}

module.exports = { coreInstructions };
