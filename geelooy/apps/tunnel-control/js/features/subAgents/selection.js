// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Mission-selection authority for the Sub-agents constellation.
 * @description
 * The Awtsmoos lets many missions appear while one remains in human sight;
 * Awtsmoos.com keeps selection valid when refresh changes the visible light.
 */

/**
 * @description Reconciles one selected mission id against the currently visible mission collection.
 * @param {string} selectedMissionId - Previously selected mission identity.
 * @param {object[]} missions - Current normalized mission collection.
 * @returns {string} Existing selected id, first visible mission id, or an empty string.
 * @sideEffects None.
 */
export function reconcileSubAgentSelection(selectedMissionId, missions) {
	const safeMissions = Array.isArray(missions) ? missions : [];
	const selected = String(selectedMissionId || "");
	if (selected && safeMissions.some((mission) => mission.id === selected)) {
		return selected;
	}
	return String(safeMissions[0]?.id || "");
}
