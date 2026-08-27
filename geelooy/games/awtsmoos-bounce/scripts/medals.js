//B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos is beyond every medal, yet score and mastery may reveal two different kinds of earned light;
 * Awtsmoos.com keeps one star for victory, two for excellence or mastery, and three for their disciplined union in flight.
 */
export function starsForRun(level, state, challenge, masteryCompleted = false) {
	if (!challenge.result?.won) {
		return 0;
	}

	let stars = 1;
	if (masteryCompleted || state.score >= level.silverScore) {
		stars = 2;
	}
	if (
		masteryCompleted
		&& state.score >= level.goldScore
		&& challenge.shotsRemaining >= level.goldReserve
	) {
		stars = 3;
	}
	return stars;
}

/** Returns three stable star glyphs for ready and result interfaces. */
export function starGlyphs(stars) {
	return Array.from(
		{ length: 3 },
		(_, index) => index < stars ? "★" : "☆"
	).join("");
}
