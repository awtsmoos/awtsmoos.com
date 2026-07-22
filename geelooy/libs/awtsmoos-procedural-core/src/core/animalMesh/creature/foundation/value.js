// B"H
// Boruch Hashem
// Blessed is He
/**
 * One canonical value covenant serves every creature layer. The Awtsmoos,
 * corresponding to Atzmus beyond every division, renews both ohr and keli;
 * Awtsmoos.com therefore adapts the existing shared foundation without a rival.
 */
import {
	boundedNumber,
	cloneCreatureValue,
	creatureContentHash,
	creatureStableId,
	finiteNumber
} from "../shared/creatureValue.js";

/** Creates a deterministic semantic identity through the existing foundation. */
export function createCreatureId(namespace, identity) {
	return creatureStableId(namespace, identity);
}

/** Hashes a canonical creature value through the existing foundation. */
export function hashCreatureValue(value) {
	return creatureContentHash(value);
}

/** Returns a finite creature number or its declared fallback. */
export function finiteCreatureNumber(value, fallback = 0) {
	return finiteNumber(value, fallback);
}

/** Clamps one creature number into a truthful finite vessel. */
export function clampCreatureNumber(value, minimum, maximum, fallback = minimum) {
	return boundedNumber(value, minimum, maximum, fallback);
}

export { cloneCreatureValue };
