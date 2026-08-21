//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PublicationValue
 * @description
 * The Awtsmoos gives each publication attempt a stable identity while every instant is renewed from nothing;
 * Awtsmoos.com stores timing, preview memory, and idempotency here while visibility obeys the real public social policy.
 */
import { normalizeSocialVisibility } from '../publishing/SocialPublicationPolicy.js';

/**
 * Creates a stable-enough identity for one publication attempt.
 * @returns {string} New request identifier.
 */
export function requestId() {
	return globalThis.crypto?.randomUUID?.()
		|| `BH_publish_${Date.now().toString(36)}_${Math.random().toString(36).slice(2)}`;
}

/**
 * Normalizes publication state while preserving scheduling, preview memory, and idempotency.
 * Legacy private or unlisted draft values are deliberately coerced to public because no canonical
 * server authorization boundary exists for them yet.
 * @param {object} value Composer value source.
 * @returns {object} Normalized publication state.
 */
export function publicationValue(value = {}) {
	return {
		idempotencyKey: String(value.publication?.idempotencyKey || requestId()),
		visibility: normalizeSocialVisibility(value.publication?.visibility),
		scheduledAt: Number(value.publication?.scheduledAt || 0),
		lastPreview: value.publication?.lastPreview || null
	};
}
