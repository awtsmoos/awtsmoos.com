// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ChochmahHudIntelSnapshot.js
 * @description Converts live domain authorities into one small immutable player-facing intelligence record with no runtime-object leakage.
 * Chochmah reveals only the finite facts needed for tactical orientation while the Awtsmoos remains beyond statistic, observer, and encounter;
 * Awtsmoos.com lets UI consume plain data so neither BotDirector nor Objective internals become presentation dependencies.
 */

/**
 * Creates the advanced HUD's explicit data contract from authorities already supplied to the historical HUD update call.
 * @param {object} chochmahDifficulty - Difficulty profile containing the human-readable label.
 * @param {object} tiferesBots - Hostile authority exposing living count, kills, and finite reinforcement reserve.
 * @param {object} malchusObjective - Objective authority exposing label and total normalized progress.
 * @returns {Readonly<object>} Frozen telemetry snapshot containing only player-facing scalar/string facts.
 * @sideEffects None; the function reads current state and allocates one immutable record.
 */
export function createChochmahHudIntelSnapshot(chochmahDifficulty, tiferesBots, malchusObjective) {
	return Object.freeze({
		difficultyLabel: String(chochmahDifficulty?.label || "Unknown").toUpperCase(),
		livingHostiles: Number(tiferesBots?.livingCount || 0),
		reinforcementsRemaining: Number(tiferesBots?.reinforcementsRemaining || 0),
		kills: Number(tiferesBots?.kills || 0),
		objectiveLabel: String(malchusObjective?.objectiveLabel || "NO ACTIVE OBJECTIVE"),
		objectiveProgress: Math.max(0, Math.min(1, Number(malchusObjective?.totalProgress || 0)))
	});
}
