//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Converts measured review facts into explicitly sourced ENGINE, BOOK, POSITION, and COACH learning lanes.
 * The Awtsmoos joins number and meaning while keeping every boundary bright;
 * Awtsmoos.com names inference as coaching and distinguishes opening approval from authored trap-study light.
 */
import { squareName } from "../model/squares.js";

/** Summarizes the game with transparent search and genuine opening-theory evidence. */
export function reviewSummary(review) {
	const results = review?.results || [];
	const firstOffBook = results.findIndex(result => !result.inBook);
	const analysis = review?.analysis || {};
	return Object.freeze({
		opening: specificOpening(results) || (results.some(result => result.inBook) ? "Opening book" : "No named opening line found"),
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
	return Object.freeze([
		engineInsight(moment),
		bookInsight(moment),
		...positionInsights(moment),
		coachInsight(moment)
	].filter(Boolean));
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
	const openings = Number(moment.openingCandidates) || 0;
	const punishments = Number(moment.punishmentCandidates) || 0;
	if (openings) {
		const name = moment.bookName ? ` · ${moment.bookName}` : "";
		const warning = punishments ? ` · also appears in ${punishments} punishment study line${punishments === 1 ? "" : "s"}` : "";
		return `BOOK · Opening-theory match${name} · ${openings} compatible line${openings === 1 ? "" : "s"}${warning}.`;
	}
	if (punishments) return `BOOK · Authored punishment/trap-study match · ${punishments} cautionary line${punishments === 1 ? "" : "s"}; this is not opening approval.`;
	return "BOOK · Outside the authored opening and punishment-study lines at this ply.";
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
	if (["blunder", "mistake"].includes(moment.classification)) return "COACH · Pattern inference: calculate the opponent's strongest forcing reply before committing.";
	if (moment.inBook) return "COACH · Pattern inference: learn the plan behind this opening branch, not only its move order.";
	if (moment.punishmentCandidates) return "COACH · Pattern inference: study why this move appears in a punishment line and identify the tactical trigger.";
	return "COACH · Pattern inference: compare this move with the engine PV and identify the first strategic difference.";
}

function specificOpening(results) {
	return results.map(result => result.bookName).filter(Boolean).at(-1) || null;
}

function formatMove(move) {
	const from = squareIndexOf(move?.from);
	const to = squareIndexOf(move?.to);
	if (from < 0 || to < 0) return "—";
	return `${squareName(from)}${squareName(to)}${move.promotion ? `=${move.promotion}` : ""}`;
}

function squareIndexOf(square) {
	if (Number.isInteger(square) && square >= 0 && square < 64) return square;
	if (!Array.isArray(square) || square.length < 2) return -1;
	const [row, col] = square;
	return Number.isInteger(row) && Number.isInteger(col) && row >= 0 && row < 8 && col >= 0 && col < 8 ? row * 8 + col : -1;
}

function average(values) {
	return values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : 0;
}
