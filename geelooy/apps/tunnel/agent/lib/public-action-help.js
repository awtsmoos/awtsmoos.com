// B"H
// Boruch Hashem
// Blessed is He

const Emergency = require("./public-action-emergency.js");

const GUIDES = Object.freeze({
	recover: Object.freeze({
		summary: "Parent-safe tunnel recovery when ordinary execution is degraded or stalled.",
		operations: Object.freeze([...Emergency.RECOVERY_OPERATIONS]),
		safeOrder: Object.freeze([
			"connectionMailboxStatus",
			"connectionMailboxReconcile",
			"nativeGenerationStatus",
			"nativeGenerationReplace",
			"nativeAgentRestart"
		]),
		examples: Object.freeze([
			Object.freeze({ operation: "connectionMailboxStatus", purpose: "Inspect durable custody without mutation." }),
			Object.freeze({ operation: "connectionMailboxReconcile", purpose: "Reconcile mailbox evidence before replacement." }),
			Object.freeze({ operation: "nativeGenerationReplace", purpose: "Replace the native execution generation out of band." })
		]),
		localFallbacks: Object.freeze([
			"~/.awtsmoos-tunnel/awt diagnose --json",
			"~/.awtsmoos-tunnel/awt help recover",
			"~/.awtsmoos-tunnel/awtsmoos-tunnel-service.sh repair",
			"curl -fsSL https://awtsmoos.com/api/tunnel/install/unix | bash"
		])
	}),
	status: Object.freeze({
		summary: "Read-only tunnel, mailbox, generation, scheduler, browser, and mission health.",
		operations: Object.freeze([...Emergency.STATUS_OPERATIONS]),
		safeOrder: Object.freeze([
			"tunnelDoctor",
			"connectionMailboxStatus",
			"nativeGenerationStatus",
			"schedulerStatus"
		]),
		examples: Object.freeze([
			Object.freeze({ operation: "tunnelDoctor", purpose: "Summarize transport and execution health." }),
			Object.freeze({ operation: "connectionMailboxStatus", purpose: "Inspect durable custody and next safe actions." })
		]),
		localFallbacks: Object.freeze(["~/.awtsmoos-tunnel/awt status", "~/.awtsmoos-tunnel/awt diagnose"])
	})
});

/** Returns a detached help covenant for one public capability. */
function describe(name) {
	const guide = GUIDES[String(name || "").trim()];
	if (!guide) return null;
	return {
		capability: String(name).trim(),
		summary: guide.summary,
		operations: [...guide.operations],
		safeOrder: [...guide.safeOrder],
		examples: guide.examples.map(example => ({ ...example })),
		localFallbacks: [...guide.localFallbacks]
	};
}

/** Returns every help-enabled public capability without exposing mutable source arrays. */
function catalog() {
	return Object.fromEntries(Object.keys(GUIDES).map(name => [name, describe(name)]));
}

module.exports = { catalog, describe };
