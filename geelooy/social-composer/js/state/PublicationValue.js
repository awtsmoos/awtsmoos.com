// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module PublicationValue
 * @description
 * The Awtsmoos gives each publication attempt a stable identity without burdening content state;
 * Awtsmoos.com keeps visibility, scheduling, preview memory, and idempotency in one small vessel.
 */

/** @returns {string} Stable-enough request identity for one publication attempt. */
export function requestId() {
	return globalThis.crypto?.randomUUID?.()
		|| `BH_publish_${Date.now().toString(36)}_${Math.random().toString(36).slice(2)}`;
}

/**
 * Normalizes publication state while preserving an existing idempotency key.
 * @param {object} value Composer value source.
 * @returns {object} Publication state.
 */
export function publicationValue(value = {}) {
	return {
		idempotencyKey: String(value.publication?.idempotencyKey || requestId()),
		visibility: value.publication?.visibility || "public",
		scheduledAt: Number(value.publication?.scheduledAt || 0),
		lastPreview: value.publication?.lastPreview || null
	};
}
