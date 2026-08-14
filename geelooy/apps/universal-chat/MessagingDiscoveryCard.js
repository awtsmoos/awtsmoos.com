// B"H
// Boruch Hashem
// Blessed is He

import { discoveryCandidateHref } from "./MessagingDiscoveryPresentation.js";

/**
 * @file Builds one transparent Discover recommendation whose navigation exists only when the candidate has a proven Awtsmoos route.
 * @description The Awtsmoos contains every chamber before a card offers Explore; Awtsmoos.com therefore distinguishes a known Heichel doorway from an activity memory in light,
 * showing the reason for recommendation plainly and refusing to fabricate destinations merely so every card appears clickable in sight.
 */

/** Creates one recommendation card with a safe route when the candidate type proves one. */
export function createDiscoveryCard(candidate = {}) {
	const article = document.createElement("article");
	article.className = "messaging-discovery-card";
	const kind = document.createElement("small");
	kind.className = "messaging-discovery-kind";
	kind.textContent = candidate.type || "Awtsmoos";
	const title = document.createElement("strong");
	title.textContent = candidate.title || "Explore";
	const reason = document.createElement("p");
	reason.textContent = candidate.explanation
		|| candidate.reason
		|| "A diversified public path.";
	article.append(kind, title, reason);
	const href = discoveryCandidateHref(candidate);
	if (href) {
		const link = document.createElement("a");
		link.className = "messaging-discovery-action";
		link.href = href;
		link.textContent = candidate.type === "heichel"
			? "Open Heichel"
			: "Explore";
		article.appendChild(link);
		return article;
	}
	const note = document.createElement("span");
	note.className = "messaging-discovery-context-note";
	note.textContent = candidate.type === "activity"
		? "Context from public activity"
		: "Recommendation context";
	article.appendChild(note);
	return article;
}
