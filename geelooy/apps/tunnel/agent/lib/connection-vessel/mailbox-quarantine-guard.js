// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Guards live mailbox testimony from quarantine without durable retirement proof.
 * @description
 * The Awtsmoos keeps a valid deed when memory fades and generations turn from sight;
 * Awtsmoos.com refuses to let age, confirmation, or missing custody counterfeit the right.
 * Corrupt parchment has another gate; valid executable testimony remains preserved in light.
 */
function create(options = {}) {
	const store = options.store;

	/**
	 * Preserves any valid durable inbox or outbox record under the current proof model.
	 * @param {string} id Exact transport receipt identity.
	 * @param {string} requestedReason Human or recovery reason requesting quarantine.
	 * @returns {object} Explicit non-replayable preservation testimony.
	 */
	function quarantineExact(id, requestedReason = "semantic_stale_custody") {
		const key = clean(id);
		const inbox = key ? store.get("inbox", key) : null;
		const outbox = key ? store.get("outbox", key) : null;
		if (!inbox && !outbox) {
			return {
				moved: false,
				preserved: false,
				safeToRedispatch: false,
				id: key,
				reason: "mailbox_record_not_found",
				requestedReason: clean(requestedReason),
				evidence: { inbox: false, outbox: false }
			};
		}
		return {
			moved: false,
			preserved: true,
			safeToRedispatch: false,
			id: key,
			reason: "durable_retirement_proof_required",
			requestedReason: clean(requestedReason),
			evidence: {
				inbox: Boolean(inbox),
				outbox: Boolean(outbox)
			}
		};
	}

	return { quarantineExact };
}

function clean(value) {
	return String(value || "").trim();
}

module.exports = { create };
