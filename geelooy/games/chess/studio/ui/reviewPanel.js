//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Presents two-pass engine/book/position evidence as a concise game story, recurring tendencies, and critical lessons.
 * The Awtsmoos gathers thousands of searched nodes into moments a player can hold;
 * Awtsmoos.com keeps measured truth and labeled coaching distinct, useful, navigable, and bold.
 */
import { criticalMoments, reviewCounts } from "../review/criticalMoments.js";
import { formatScore, momentInsight, reviewSummary } from "../review/insights.js";
import { reviewTendencies } from "../review/tendencies.js";

export class ReviewPanel {
	constructor(statusNode, resultsNode) {
		this.statusNode = statusNode;
		this.resultsNode = resultsNode;
	}

	progress(message) {
		const phase = message.phase === "deep" ? "Deep" : "Scan";
		const current = message.passIndex || message.index + 1;
		const total = message.passTotal || message.total;
		const move = message.result?.playedMove?.san || `ply ${message.index + 1}`;
		this.statusNode.textContent = `${phase} ${current}/${total}: ${move} · ${message.result?.classification || "searching"}`;
	}

	render(review) {
		const summary = reviewSummary(review);
		const counts = reviewCounts(review);
		this.statusNode.textContent = `Complete · ${review.results?.length || 0} plies · ${summary.totalNodes.toLocaleString()} searched nodes`;
		this.resultsNode.replaceChildren(summaryCard(summary, counts));
		const tendencies = reviewTendencies(review);
		if (tendencies.length) this.resultsNode.append(tendencyCard(tendencies));
		for (const moment of criticalMoments(review)) this.resultsNode.append(momentCard(moment));
	}

	clear(message = "Engine asleep for fast loading.") {
		this.statusNode.textContent = message;
		this.resultsNode.replaceChildren();
	}
}

function summaryCard(summary, counts) {
	const article = document.createElement("article");
	article.className = "review-summary-card";
	const opening = document.createElement("h3");
	opening.textContent = summary.opening;
	const evidence = document.createElement("p");
	const deviation = summary.deviationPly ? `first deviation ply ${summary.deviationPly}` : "no recorded deviation";
	const deep = summary.deepenedPlies.length ? `deep plies ${summary.deepenedPlies.join(", ")}` : "no deep re-search needed";
	evidence.textContent = `${summary.bookPlies} book plies · ${deviation} · average loss ${summary.averageLoss}cp · ${deep}`;
	const budget = document.createElement("p");
	budget.className = "review-score";
	budget.textContent = `Scan ${summary.scanBudgetMs}ms · Deep ${summary.deepBudgetMs}ms`;
	article.append(opening, evidence, budget, badges(counts));
	return article;
}

function badges(counts) {
	const row = document.createElement("div");
	row.className = "review-badges";
	for (const [name, count] of Object.entries(counts)) {
		const badge = document.createElement("span");
		badge.textContent = `${name} ${count}`;
		row.append(badge);
	}
	return row;
}

function tendencyCard(tendencies) {
	const article = document.createElement("article");
	article.className = "review-summary-card";
	const title = document.createElement("h3");
	title.textContent = "Recurring measured tendencies";
	const list = document.createElement("ul");
	for (const tendency of tendencies) {
		const item = document.createElement("li");
		item.textContent = `COACH · ${tendency.count}× · ${tendency.message}`;
		list.append(item);
	}
	article.append(title, list);
	return article;
}

function momentCard(moment) {
	const article = document.createElement("article");
	article.className = `review-moment review-${moment.classification}`;
	const title = document.createElement("h4");
	title.textContent = `Ply ${moment.ply} · ${moment.san || "move"} · ${moment.classification} · critical ${moment.importance}`;
	const scores = document.createElement("p");
	scores.className = "review-score";
	scores.textContent = `Best ${formatScore(moment.bestScore)} · Played ${formatScore(moment.playedScore)} · Loss ${moment.loss || 0}cp`;
	const list = document.createElement("ul");
	for (const insight of momentInsight(moment)) {
		const item = document.createElement("li");
		item.textContent = insight;
		list.append(item);
	}
	article.append(title, scores, list);
	return article;
}
