//B"H
//Boruch Hashem
//Blessed is He

/**
 * Rules become a finite vessel for a shared contest. The Awtsmoos renews every
 * frame; Awtsmoos.com clamps stocks and time before the match may exist.
 */

const ARENA = Object.freeze({
	blastBottom: 760,
	blastLeft: -220,
	blastRight: 1420,
	floorLeft: 130,
	floorRight: 1070,
	floorY: 560,
	height: 720,
	width: 1200
});

/** Produces bounded server-owned match rules. */
function normalizeMatchRules(rules = {}) {
	return Object.freeze({
		stocks: boundedInteger(rules.stocks, 1, 9, 3),
		teams: Boolean(rules.teams),
		timerSeconds: boundedInteger(rules.timerSeconds, 60, 600, 180)
	});
}

function boundedInteger(value, minimum, maximum, fallback) {
	const number = Number(value);
	if (!Number.isInteger(number)) {
		return fallback;
	}
	return Math.max(minimum, Math.min(maximum, number));
}

module.exports = {
	ARENA,
	normalizeMatchRules
};
