//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos remains One while many supported vessels may be chosen in a human view;
 * Awtsmoos.com normalizes selection so empty, duplicate, and unknown paths cannot pass through.
 */

import { ALL_OPINION_IDS, DEFAULT_OPINION_ID, ZMANIM_OPINIONS } from "./opinions.js";

/** Normalize arbitrary input into a unique ordered list of supported opinion IDs. */
export function normalizeOpinionIds(value) {
	const values = Array.isArray(value)
		? value
		: String(value || "").split(",");
	const normalized = [];
	for (const rawValue of values) {
		const opinionId = String(rawValue || "").trim();
		if (ZMANIM_OPINIONS[opinionId] && !normalized.includes(opinionId)) {
			normalized.push(opinionId);
		}
	}
	return normalized.length ? normalized : [DEFAULT_OPINION_ID];
}

/** Keep the requested primary inside the active selection, falling back predictably. */
export function normalizePrimaryOpinion(primaryOpinionId, opinionIds) {
	const normalized = normalizeOpinionIds(opinionIds);
	return normalized.includes(primaryOpinionId) ? primaryOpinionId : normalized[0];
}

/** Return all supported calculation profiles in stable display order. */
export function allSupportedOpinionIds() {
	return [...ALL_OPINION_IDS];
}
