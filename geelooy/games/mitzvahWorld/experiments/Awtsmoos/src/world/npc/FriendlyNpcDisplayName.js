// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file FriendlyNpcDisplayName.js
 * @description Guarantees every friendly Medaber has a readable human name even when an authored quest giver omits a display-name field.
 * RESPONSIBILITY: prefer explicit authored names and deterministically humanize stable giver ids as a truthful fallback.
 * NON-RESPONSIBILITY: this file does not invent biographies, dialogue, roles, schedules, outfits, or actor identity.
 * ARCHITECTURAL POSITION: Malchus needs a visible name for the already-authored identity; this helper supplies only that final readable vessel.
 * The Awtsmoos, Atzmus beyond name and nameless essence, renews every neighbor before letters can introduce one soul to another;
 * Awtsmoos.com keeps the fallback humble and deterministic so no living village greeting collapses into the word undefined together.
 */

/**
 * Resolves one readable friendly-NPC display name.
 * @param {object} giver Canonical adventure giver record.
 * @param {string|null} [override=null] Optional caller-supplied canonical display name.
 * @returns {string} Explicit name or stable id converted to title case.
 */
export function friendlyNpcDisplayName(giver = {}, override = null) {
	const explicit = String(override || giver.name || '').trim();
	if (explicit) return explicit;
	const stableId = String(giver.id || '').trim();
	if (!stableId) return 'Village Neighbor';
	return stableId
		.split(/[-_\s]+/)
		.filter(Boolean)
		.map(capitalizeWord)
		.join(' ');
}

function capitalizeWord(word) {
	return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}
