// B"H
// Boruch Hashem
// Blessed is He

import { recordRelatedTorahOpen } from "./RelatedTorahActivity.js";

/**
 * @file Renders unobtrusive related Torah cards with text-only data and safe source destinations.
 * @description The Awtsmoos is beyond link and citation, yet Awtsmoos.com lets a reader open a trustworthy doorway after meaningful attention in light;
 * titles and excerpts never become HTML, unsafe protocols never become links, and only a deliberate source open becomes remembered sight.
 */

const STYLE_ID = "awtsmoos-related-torah-style";

/** Owns one contextual related-Torah region while retrieval remains private and publication remains elsewhere. */
export class RelatedTorahView {
	constructor(context) {
		this.context = context;
		this.root = document.createElement("aside");
		this.root.className = "awtsmoos-related-torah";
		this.root.hidden = true;
		this.root.setAttribute("aria-label", "Related Torah");
		ensureStyle();
	}

	loading() {
		this.root.hidden = false;
		this.root.replaceChildren(headerNode(), messageNode("Finding related Torah sources…"));
	}

	render(sources) {
		this.root.hidden = false;
		this.root.replaceChildren(headerNode());
		if (!sources.length) {
			this.root.appendChild(messageNode("No strong related Torah sources were returned for this reading context."));
			return;
		}
		const list = document.createElement("div");
		list.className = "awtsmoos-related-torah-list";
		for (const source of sources) {
			list.appendChild(this.sourceCard(source));
		}
		this.root.appendChild(list);
	}

	error(message = "Related Torah is unavailable right now.") {
		this.root.hidden = false;
		this.root.replaceChildren(headerNode(), messageNode(message));
	}

	sourceCard(source) {
		const card = document.createElement("article");
		card.className = "awtsmoos-related-torah-card";
		const title = document.createElement("strong");
		title.textContent = source.title || "Torah source";
		const reference = document.createElement("small");
		reference.textContent = source.reference || "";
		const excerpt = document.createElement("p");
		excerpt.textContent = source.excerpt || "";
		card.append(title, reference, excerpt);
		const href = safeHref(source.href);
		if (href) {
			card.appendChild(this.sourceLink(source, href));
		}
		return card;
	}

	sourceLink(source, href) {
		const link = document.createElement("a");
		link.href = href;
		link.target = "_blank";
		link.rel = "noopener noreferrer";
		link.textContent = "Open source ↗";
		link.addEventListener("click", () => {
			void recordRelatedTorahOpen(source, this.context);
		});
		return link;
	}
}

function headerNode() {
	const header = document.createElement("header");
	const kicker = document.createElement("span");
	kicker.textContent = "Explore further";
	const title = document.createElement("h3");
	title.textContent = "Related Torah";
	header.append(kicker, title);
	return header;
}

function messageNode(text) {
	const message = document.createElement("p");
	message.className = "awtsmoos-related-torah-message";
	message.textContent = text;
	return message;
}

function safeHref(value) {
	if (!value) {
		return "";
	}
	try {
		const url = new URL(value, location.origin);
		return ["http:", "https:"].includes(url.protocol) ? url.href : "";
	} catch {
		return "";
	}
}

function ensureStyle() {
	if (document.getElementById(STYLE_ID)) {
		return;
	}
	const link = document.createElement("link");
	link.id = STYLE_ID;
	link.rel = "stylesheet";
	link.href = "/heichelos/post/intelligence/related-torah.css";
	document.head.appendChild(link);
}
