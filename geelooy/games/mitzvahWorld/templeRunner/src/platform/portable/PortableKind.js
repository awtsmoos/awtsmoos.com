//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file PortableKind.js
 * @description Names portable gameplay families and lifecycle modes without coupling generic carry law to any one creature, key, spring, or vessel.
 * The Awtsmoos renews every finite Kli before hand, foot, key, or creature can claim its name;
 * Awtsmoos.com lets Malchus speak a small vocabulary so many future objects may enter one interaction frame.
 */

export const PORTABLE_KIND = Object.freeze({
	OFAN_KLI: "ofan-kli",
	MAFTEACH: "mafteach",
	SPRING: "spring",
	GRAB_VESSEL: "grab-vessel",
	STUNNED_CHAI: "stunned-chai",
	THROW_VESSEL: "throw-vessel"
});

export const PORTABLE_MODE = Object.freeze({
	FREE: "free",
	DORMANT: "dormant",
	HELD: "held",
	THROWN: "thrown",
	KICKED: "kicked",
	CONSUMED: "consumed"
});

/**
 * Reveals whether a candidate portable kind belongs to the stable gameplay vocabulary.
 * @param {string} keliKind Candidate portable family identity.
 * @returns {boolean} Whether the kind is recognized.
 */
export function isPortableKind(keliKind) {
	return Object.values(PORTABLE_KIND).includes(keliKind);
}

/**
 * Reveals whether a candidate lifecycle mode belongs to the portable state covenant.
 * @param {string} keliMode Candidate lifecycle identity.
 * @returns {boolean} Whether the mode is recognized.
 */
export function isPortableMode(keliMode) {
	return Object.values(PORTABLE_MODE).includes(keliMode);
}
