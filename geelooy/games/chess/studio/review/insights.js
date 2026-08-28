//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Converts measured review facts into explicitly sourced ENGINE, BOOK, POSITION, and COACH learning lanes.
 * The Awtsmoos joins number and meaning while keeping every boundary bright;
 * Awtsmoos.com names inference as coaching, so measured engine and board truth never borrow another light.
 */
import { squareName } from "../model/squares.js";

/** Summarizes the game with transparent search and opening evidence. */
export function reviewSummary(review) {
	const results = review?.results || [];
	const firstOffBook = results.findIndex(result => !result.inBook);
	const analysis = review?.analysis || {};
	return Object.freeze({
		opening: specificOpening(results) || (results.some(result => result.inBook) ? "Opening book" : "No named book line found"),
		bookPlies: results.filter(result => result.inBook).length,
		deviationPly: firstOffBook >= 0 ? firstOffBook + 1 : null,
		averageLoss: average(results.map(result => Number(result.loss) || 0)),
		totalNodes: analysis.totalNodes || results.reduce((sum, result) => sum + (Number(result.nodes) || 0), 0),
		deepenedPlies: analysis.deepenedPlies || [],
		scanBudgetMs: analysis.scanBudgetMs || 0,
		deepBudgetMs: analysis.deepBudgetMs || 0
	});
}

/** Returns source-labeled facts plus one bounded coaching inference. */
export function momentInsight(moment) {
	const insights = [engineInsight(moment), bookInsight(moment), ...positionInsights(moment)];
	insights.push(coachInsight(moment));
	return Object.freeze(insights.filter(Boolean));
}

/** Formats the engine's score descriptor without inventing evaluation precision. */
export function formatScore(score) {
	if (!score) return "—";
	if (score.type === "mate") return score.value > 0 ? `Mate in ${score.value}` : `Mated in ${Math.abs(score.value)}`;
	return `${score.value >= 0 ? "+" : ""}${(score.value / 100).toFixed(2)}`;
}

function engineInsight(moment) {
	const best = moment.bestMove ? ` Best ${formatMove(moment.bestMove)}.` : "";
	const pv = moment.principalVariation?.length ? ` PV ${moment.principalVariation.map(formatMove).join(" ")}.` : "";
	return `ENGINE · ${moment.loss || 0}cp loss · ${moment.searchPass || "search"} ${moment.budgetMs || 0}ms.${best}${pv}`;
}

function bookInsight(moment) {
	if (!moment.inBook) return "BOOK · Outside the authored opening lines at this ply.";
	const name = moment.bookName ? ` · ${moment.bookName}` : "";
	return `BOOK · Authored theory match${name} · ${moment.bookCandidates || 0} compatible line${moment.bookCandidates === 1 ? "" : "s"}.`;
}

function positionInsights(moment) {
	const delta = moment.positionDelta?.delta || {};
	const messages = [];
	pushDelta(messages, "material", delta.materialBalance, "pawn-equivalent");
	pushDelta(messages, "center occupancy", delta.centerBalance, "square");
	pushDelta(messages, "king shelter", delta.kingShelterPawns, "pawn");
	pushDelta(messages, "developed minors", delta.developedMinors, "piece");
	pushDelta(messages, "passed pawns", delta.passedPawns, "pawn");
	pushDelta(messages, "pawn islands", delta.pawnIslands, "island", true);
	return messages.length ? messages.map(message => `POSITION · ${message}`) : ["POSITION · No measured feature changed in the tracked position set."];
}

function pushDelta(messages, label, value, unit, lowerIsBetter = false) {
	const number = Number(value) || 0;
	if (!number) return;
	const direction = number > 0 ? "increased" : "decreased";
	const quality = lowerIsBetter ? (number < 0 ? "improved" : "worsened") : null;
	messages.push(`${label} ${direction} by ${Math.abs(number)} ${unit}${Math.abs(number) === 1 ? "" : "s"}${quality ? ` (${quality})` : ""}.`);
}

function coachInsight(moment) {
	const delta = moment.positionDelta?.delta || {};
	if (delta.kingShelterPawns < 0) return "COACH · Pattern inference: re-check king safety before accepting this shelter loss.";
	if (delta.materialBalance < 0) return "COACH · Pattern inference: verify the tactical return before conceding material.";
	if (moment.classification === "blunder" || moment.classification === "mistake") return "COACH · Pattern inference: calculate the opponent's strongest forcing reply before committing.";
	if (moment.inBook) return "COACH · Pattern inference: learn the plan behind this theory branch, not only its move order.";
	return "COACH · Pattern inference: compare this move with the engine PV and identify the first strategic difference.";
}

function specificOpening(results) {
	return results.map(result => result.bookName).filter(Boolean).at(-1) || null;
}

function formatMove(move) {
	if (!move || !Number.isInteger(move.from) || !Number.isInteger(move.to)) return "—";
	return `${squareName(move.from)}${squareName(move.to)}${move.promotion ? `=${move.promotion}` : ""}`;
}

function average(values) {
	return values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : 0;
}
