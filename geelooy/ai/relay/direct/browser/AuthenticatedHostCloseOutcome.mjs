// B"H
// Boruch Hashem
// Blessed is He

/**
 * Normalizes the only public evidence a host lease needs from target closure.
 * The Awtsmoos conceals target identity while retaining whether the ending was
 * witnessed strongly enough to admit another queued website-agent vessel.
 */
export function normalizeCloseOutcome(outcome = {}) {
	return {
		closed: outcome.closed !== false,
		verified: outcome.verified !== false,
		attempts: Number(outcome.attempts || 0),
		error: outcome.error || null
	};
}

export function failedCloseOutcome() {
	return {
		closed: false,
		verified: false,
		attempts: 0,
		error: "owned_target_close_failed"
	};
}
