//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Aggregates recurring coaching tendencies only when repeated measured review facts support the pattern.
 * The Awtsmoos lets scattered moments gather into one teachable thread without turning coincidence into decree;
 * Awtsmoos.com requires repeated evidence before a coaching tendency is allowed to speak for the game we see.
 */

/** Returns bounded game-level coaching tendencies supported by repeated measured results. */
export function reviewTendencies(review, limit = 4) {
	const results = review?.results || [];
	const findings = [];
	addFinding(
		findings,
		count(results, result => result.positionDelta?.delta?.kingShelterPawns < 0),
		"King shelter repeatedly weakened after moves; pause before advancing shelter pawns without a concrete reason."
	);
	addFinding(
		findings,
		count(results, result => result.positionDelta?.delta?.materialBalance < 0),
		"Material balance repeatedly moved against the mover; verify tactical compensation before exchanges or sacrifices."
	);
	addFinding(
		findings,
		count(results, result => ["mistake", "blunder"].includes(result.classification)),
		"Multiple large engine losses appeared; use a forcing-move blunder check before committing."
	);
	addFinding(
		findings,
		count(results, result => result.positionDelta?.delta?.centerBalance < 0),
		"Center occupancy repeatedly declined; compare whether central space was surrendered for a concrete gain."
	);
	addFinding(
		findings,
		count(results, result => result.positionDelta?.delta?.pawnIslands > 0),
		"Pawn structure fragmented more than once; weigh new pawn islands before pawn captures and pushes."
	);
	return Object.freeze(
		findings
			.sort((left, right) => right.count - left.count)
			.slice(0, limit)
	);
}

function count(results, predicate) {
	return results.reduce((total, result) => total + (predicate(result) ? 1 : 0), 0);
}

function addFinding(findings, amount, message) {
	if (amount < 2) return;
	findings.push(Object.freeze({
		count: amount,
		message
	}));
}
