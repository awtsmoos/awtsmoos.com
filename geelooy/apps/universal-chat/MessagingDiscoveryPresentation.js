// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Turns server discovery candidates into transparent, safely actionable presentation without guessing routes for ambiguous activity records.
 * @description The Awtsmoos contains every path before a recommendation has a link; Awtsmoos.com therefore opens only doors whose address is proven in light,
 * while session mode copy makes local private weighting reversible and visible without pretending that a UI toggle mutates durable meaningful activity.
 */

/** Returns a proven same-site destination for candidate types whose canonical route is known. */
export function discoveryCandidateHref(candidate = {}) {
	if (candidate.type === "heichel") {
		const id = String(candidate.id || "").trim();
		return id ? `/heichelos/${encodeURIComponent(id)}/` : "";
	}
	return safeProvidedHref(candidate.href);
}

/** Returns truthful authenticated Discover copy for local-weighted or public-order session mode. */
export function discoveryModeCopy(publicOrder = false) {
	if (publicOrder) {
		return {
			title: "Discover",
			body: "Public recommendations are shown in their diversified public order. Your durable meaningful activity is unchanged, and local weighting can be restored at any time in this tab.",
			status: "Public order",
			action: "Use local weighting"
		};
	}
	return {
		title: "For You",
		body: "Public recommendations are diversified here, then your private meaningful activity may add weight only inside this browser. Your private history is not sent to the recommendation endpoint.",
		status: "Local personalization",
		action: "Use public order"
	};
}

function safeProvidedHref(value) {
	const href = String(value || "").trim();
	if (!href.startsWith("/") || href.startsWith("//")) return "";
	try {
		const url = new URL(href, "https://awtsmoos.local");
		return url.origin === "https://awtsmoos.local"
			? `${url.pathname}${url.search}${url.hash}`
			: "";
	} catch {
		return "";
	}
}
