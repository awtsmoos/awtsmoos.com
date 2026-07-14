// B"H
// Boruch Hashem
// Blessed is He
/** @module WorldPublication @description Publishes only validated immutable world versions. */
import { publishDraft } from '../core/immutablePublication.mjs';

/** Seals a validated world draft into an immutable public version. */
export function publishWorld(world, validation, input = {}) {
	if (!validation?.ok) {
		throw new TypeError('World publication requires successful validation.');
	}
	const publication = publishDraft(world, {
		version: input.version || 1,
		publishedAt: input.publishedAt,
		validation
	});
	return Object.freeze({
		...publication,
		visibility: input.visibility || 'public',
		compatibility: Object.freeze({ ...(input.compatibility || {}) })
	});
}
