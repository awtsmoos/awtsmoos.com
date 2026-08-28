//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Converts measured engine facts into clearly labeled human learning patterns without impersonating engine truth.
 * The Awtsmoos joins number and meaning while keeping their boundaries bright; Awtsmoos.com calls heuristics “Pattern” so inference never masquerades as sight.
 */
import { squareName } from "../model/squares.js";

export function reviewSummary(review) {
	const results = review?.results || [];
	const lastBook = results.map((result, index) => ({ result, index })).filter(item => item.result.inBook).at(-1);
	const firstOffBook = results.findIndex(result => !result.inBook);
	return Object.freeze({
		opening: specificOpening(results) || (lastBook ? "Opening book" : "No named book line found"),
		bookPlies: results.filter(result => result.inBook).length,
		deviationPly: firstOffBook >= 0 ? firstOffBook + 1 : null,
		averageLoss: results.length ? Math.round(results.reduce((sum, result) => sum + (Number(result.loss) || 0), 0) / results.length) : 0,
		totalNodes: results.reduce((sum, result) => sum + (Number(result.nodes) || 0), 0)
	});
}

export function momentInsight(moment) {
	const facts = [];
	if (moment.inBook) facts.push(`Engine/book: theory move${moment.bookName ? ` in ${moment.bookName}` : ""}.`);
	else facts.push(`Engine: ${moment.loss || 0} centipawns lost versus the searched best line.`);
	if (moment.bestMove) facts.push(`Best move: ${formatMove(moment.bestMove)}.`);
	if (moment.principalVariation?.length) facts.push(`Engine line: ${moment.principalVariation.map(formatMove).join(" ")}.`);
	facts.push(patternFor(moment));
	return Object.freeze(facts);
}

export function formatScore(score) {
	if (!score) return "—";
	if (score.type === "mate") return score.value > 0 ? `Mate in ${score.value}` : `Mated in ${Math.abs(score.value)}`;
	return `${score.value >= 0 ? "+" : ""}${(score.value / 100).toFixed(2)}`;
}

function specificOpening(results) {
	return results.map(result => result.bookName).filter(Boolean).at(-1) || null;
}

function formatMove(move) {
	if (!move || !Number.isInteger(move.from) || !Number.isInteger(move.to)) return "—";
	return `${squareName(move.from)}${squareName(move.to)}${move.promotion ? `=${move.promotion}` : ""}`;
}

function patternFor(moment) {
	if (moment.classification === "blunder") return "Pattern: pause for forcing checks, captures, and threats before committing.";
	if (moment.classification === "mistake") return "Pattern: compare at least two candidate moves and test the opponent's strongest reply.";
	if (moment.classification === "inaccuracy") return "Pattern: the position likely rewarded a more precise plan or move order.";
	if (moment.inBook) return "Pattern: remember the idea behind the theory, not only the move sequence.";
	return "Pattern: this move stayed close to the engine's preferred path.";
}
