// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MalchusHudIntelTelemetry.js
 * @description Manifests one plain combat-intelligence snapshot into the retractable disclosure without owning game or disclosure state.
 * Malchus reveals finite tactical facts while the Awtsmoos remains beyond data, DOM, concealment, and revelation;
 * Awtsmoos.com lets this projector remain deliberately simple so telemetry rendering can be tested apart from cognition, runtime, and CSS mechanics.
 */

/**
 * Projects one explicit intelligence snapshot into already-resolved disclosure elements.
 * @param {object} malchusElements - Resolved INTEL element map.
 * @param {object} chochmahSnapshot - Plain player-facing telemetry record.
 * @returns {void}
 * @sideEffects Mutates text and progress values only; disclosure state and gameplay state remain untouched.
 */
export function projectMalchusHudIntelTelemetry(malchusElements, chochmahSnapshot) {
	if (!malchusElements) return;
	if (malchusElements.difficulty) malchusElements.difficulty.textContent = chochmahSnapshot.difficultyLabel;
	if (malchusElements.hostiles) malchusElements.hostiles.textContent = String(chochmahSnapshot.livingHostiles);
	if (malchusElements.reinforcements) malchusElements.reinforcements.textContent = String(chochmahSnapshot.reinforcementsRemaining);
	if (malchusElements.kills) malchusElements.kills.textContent = String(chochmahSnapshot.kills);
	if (malchusElements.objective) malchusElements.objective.textContent = chochmahSnapshot.objectiveLabel;
	if (malchusElements.progress) malchusElements.progress.value = Math.round(chochmahSnapshot.objectiveProgress * 100);
}
