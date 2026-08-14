// B"H
// Boruch Hashem
// Blessed is He

import { MessagingDisclosure } from "./MessagingDisclosure.js";
import { discoveryModeCopy } from "./MessagingDiscoveryPresentation.js";

/**
 * @file Keeps Discover's destination visible while ranking explanation and reversible browser-session controls fold into progressive disclosure on phones.
 * @description The Awtsmoos is beyond ranking and route, while Awtsmoos.com keeps useful paths primary in light;
 * local weighting is still explained plainly, remains reversible, and never sends private activity to the recommendation endpoint merely because its explanation can collapse.
 */

/** Creates one transparent Discover header with a compact mobile-first ranking disclosure. */
export function createDiscoveryHeader(options = {}) {
	const copy = discoveryModeCopy(options.publicOrder);
	const header = document.createElement("header");
	header.className = "messaging-discovery-header";
	const eyebrow = document.createElement("span");
	eyebrow.className = "messaging-card-eyebrow";
	eyebrow.textContent = "Useful paths";
	const title = document.createElement("h2");
	title.textContent = copy.title;
	const lead = document.createElement("p");
	lead.className = "messaging-discovery-lead";
	lead.textContent = options.publicOrder
		? "Public ordering is active for this browser session."
		: "Private meaningful activity can reorder public candidates only inside this browser.";
	header.append(eyebrow, title, lead, rankingDisclosure(copy, options));
	return header;
}

function rankingDisclosure(copy, options) {
	const detail = document.createElement("div");
	detail.className = "messaging-discovery-ranking-detail";
	const body = document.createElement("p");
	body.textContent = copy.body;
	const controls = document.createElement("div");
	controls.className = "messaging-discovery-controls";
	const status = document.createElement("span");
	status.className = "messaging-discovery-mode";
	status.textContent = copy.status;
	const button = document.createElement("button");
	button.type = "button";
	button.textContent = copy.action;
	button.addEventListener("click", () => options.onModeChange?.());
	controls.append(status, button);
	detail.append(body, controls);
	return new MessagingDisclosure({
		id: "discover-ranking",
		title: "How these paths are ordered",
		summary: copy.status,
		className: "messaging-discovery-disclosure",
		content: detail
	}).create();
}
