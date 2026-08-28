//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Classifies a legal chess position into opening, middlegame, or endgame from deterministic board facts.
 * The Awtsmoos renews one game through changing garments while its lawful continuity stays the same;
 * Awtsmoos.com names the present phase without importing engine opinion into the semantic frame.
 */
const NON_PAWN_VALUES = Object.freeze({ N: 3, B: 3, R: 5, Q: 9 });

/**
 * Classifies game phase using remaining material, queens, and ply.
 * @param {{board:Array<string|null>}} position Current legal position.
 * @param {number} ply Number of half-moves already played.
 * @returns {"opening"|"middlegame"|"endgame"} Deterministic phase label.
 */
export function classifyGamePhase(position, ply = 0) {
	const summary = summarizePhaseMaterial(position?.board || []);
	if (isEndgame(summary)) return "endgame";
	if (ply <= 20 && summary.pieces >= 24 && summary.nonPawn >= 34) return "opening";
	return "middlegame";
}

/**
 * Summarizes material signals used only for phase classification.
 * @param {Array<string|null>} board Sixty-four-square board array.
 * @returns {{pieces:number,queens:number,nonPawn:number}} Stable phase measurements.
 */
export function summarizePhaseMaterial(board) {
	let pieces = 0;
	let queens = 0;
	let nonPawn = 0;
	for (const piece of board) {
		if (!piece) continue;
		pieces++;
		const type = piece[1];
		if (type === "Q") queens++;
		nonPawn += NON_PAWN_VALUES[type] || 0;
	}
	return Object.freeze({ pieces, queens, nonPawn });
}

/**
 * Detects materially reduced positions where endgame camera and pacing become appropriate.
 * @param {{queens:number,nonPawn:number,pieces:number}} summary Material summary.
 * @returns {boolean} Whether the position is materially an endgame.
 */
function isEndgame(summary) {
	if (summary.nonPawn <= 18) return true;
	if (summary.queens === 0 && summary.nonPawn <= 28) return true;
	return summary.pieces <= 12;
}
