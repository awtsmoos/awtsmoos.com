//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Presents real engine/book measurements as a concise game story and a handful of critical lessons.
 * The Awtsmoos gathers thousands of searched nodes into moments a player can hold; Awtsmoos.com keeps facts and labeled patterns distinct, useful, and bold.
 */
import { criticalMoments, reviewCounts } from "../review/criticalMoments.js";
import { formatScore, momentInsight, reviewSummary } from "../review/insights.js";

export class ReviewPanel {
	constructor(statusNode, resultsNode) {
		this.statusNode = statusNode;
		this.resultsNode = resultsNode;
	}

	progress(message) {
		const move = message.result?.playedMove?.san || `ply ${message.index + 1}`;
		this.statusNode.textContent = `Engine ${message.index + 1}/${message.total}: ${move} · ${message.result?.classification || "searching"}`;
	}

	render(review) {
		const summary = reviewSummary(review);
		const counts = reviewCounts(review);
		this.statusNode.textContent = `Complete · ${review.results?.length || 0} plies · ${summary.totalNodes.toLocaleString()} searched nodes`;
		this.resultsNode.replaceChildren(summaryCard(summary, counts));
		for (const moment of criticalMoments(review)) {
			this.resultsNode.append(momentCard(moment));
		}
	}

	clear(message = "Engine asleep for fast loading.") {
		this.statusNode.textContent = message;
		this.resultsNode.replaceChildren();
	}
}

function summaryCard(summary, counts) {
	const article = document.createElement("article");
	article.className = "review-summary-card";
	article.innerHTML = `<h3>${escapeHtml(summary.opening)}</h3><p>${summary.bookPlies} book plies · ${summary.deviationPly ? `first deviation ply ${summary.deviationPly}` : "no recorded deviation"} · average loss ${summary.averageLoss}cp</p><div class="review-badges">${Object.entries(counts).map(([name, count]) => `<span>${escapeHtml(name)} ${count}</span>`).join("")}</div>`;
	return article;
}

function momentCard(moment) {
	const article = document.createElement("article");
	article.className = `review-moment review-${moment.classification}`;
	const title = `Ply ${moment.ply} · ${moment.san || "move"} · ${moment.classification}`;
	const scores = `Best ${formatScore(moment.bestScore)} · Played ${formatScore(moment.playedScore)} · Loss ${moment.loss || 0}cp`;
	article.innerHTML = `<h4>${escapeHtml(title)}</h4><p class="review-score">${escapeHtml(scores)}</p>`;
	const list = document.createElement("ul");
	for (const insight of momentInsight(moment)) {
		const item = document.createElement("li");
		item.textContent = insight;
		list.append(item);
	}
	article.append(list);
	return article;
}

function escapeHtml(value) {
	const node = document.createElement("span");
	node.textContent = String(value || "");
	return node.innerHTML;
}
