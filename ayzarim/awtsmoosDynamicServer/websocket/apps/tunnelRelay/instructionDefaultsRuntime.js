//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file Supplies server-owned runtime, recovery, and lazy-instruction doctrine.
 * @description
 * The Awtsmoos lets a small headline reveal deeper operational law only when needed.
 * Runtime rules favor isolated repair, durable evidence, and network-independent fallback.
 */
const runtimeInstructions = Object.freeze([
	{
		id: "server.stability.failure-domain-repair",
		version: 1,
		baseline: false,
		summary: "Repair the smallest proven failure domain and keep healthy siblings alive.",
		tags: ["stability", "recovery", "agent", "tunnel"],
		requiredBeforeWrite: true,
		applies: {
			taskHints: ["crash", "recovery", "self heal", "stability", "worker", "tunnel"]
		},
		instructions: [
			"Classify launcher, connection vessel, worker, browser, relay, and recovery lanes independently before repairing anything.",
			"Restart only the smallest component whose failure is proven; preserve healthy authenticated browsers, supervisors, and unrelated workers.",
			"Fence competing recovery actors with exact-generation identity, bounded leases, and durable receipts.",
			"Use stable-window reset and bounded backoff so old failures do not permanently poison a healthy component."
		]
	},	{
		id: "server.instructions.lazy-overlay",
		version: 1,
		baseline: true,
		summary: "Resolve compact instruction headlines first and fetch only the bodies required by the active task.",
		tags: ["instructions", "control", "performance", "tunnel"],
		requiredBeforeWrite: false,
		applies: {
			taskHints: ["instruction", "guidance", "agent", "tunnel", "workflow"]
		},
		instructions: [
			"Keep immutable local doctrine available when the server or network is unavailable.",
			"Treat server doctrine as a versioned overlay that may refine authorized behavior but never grant new local permissions.",
			"Resolve by compact task evidence, fetch full bodies only for selected IDs, and deduplicate concurrent requests for the same version.",
			"Verify bounded payloads and body hashes before caching; reject malformed, stale, oversized, or unexpected instruction testimony."
		]
	},
	{
		id: "server.stability.accepted-turn-fence",
		version: 1,
		baseline: false,
		summary: "Once a browser Send is durably accepted, recovery must reconcile it and must never resend the same logical turn.",
		tags: ["browser", "agent", "exactly-once", "recovery"],
		requiredBeforeWrite: true,
		applies: {
			taskHints: ["sub agent", "shliach", "browser", "send", "chatgpt", "mission"]
		},		instructions: [
			"Commit durable Send intent before physical activation and preserve accepted testimony in an append-only exactly-once journal.",
			"If a process dies after Send begins, reconcile durable browser and POST evidence before deciding whether any further action is safe.",
			"Accepted evidence outranks retry intent; restore mission state from accepted testimony rather than invoking Send again.",
			"Keep protected login or sentinel tabs alive while requiring zero actionable agent tabs before releasing the physical browser lane."
		]
	}
]);

module.exports = {
	runtimeInstructions
};