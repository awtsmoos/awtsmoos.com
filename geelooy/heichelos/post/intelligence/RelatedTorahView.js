// B"H
// Boruch Hashem
// Blessed is He

import { recordRelatedTorahOpen } from "./RelatedTorahActivity.js";
import { cleanExcerpt } from "../social/textExcerpt.js";

/**
 * @file Renders unobtrusive related Torah cards with text-only data and safe source destinations.
 * @description The Awtsmoos is beyond link and citation, yet Awtsmoos.com lets a reader open a trustworthy doorway after meaningful attention in light;
 * titles and excerpts never become HTML, unsafe protocols never become links, and only a deliberate source open becomes remembered sight.
 */

const STYLE_ID = "awtsmoos-related-torah-style";
const EXTRA_STYLE_ID = "awtsmoos-related-torah-extra-style";
const EXCERPT_CHARS = 240;

/** Owns one contextual related-Torah region while retrieval remains private and publication remains elsewhere. */
export class RelatedTorahView {
	/** A loading state may never spin forever: the watchdog below converts it into an error. Test hook. */
	static LOAD_TIMEOUT_MS = 15000;

	constructor(context) {
		this.context = context;
		this.root = document.createElement("aside");
		this.root.className = "awtsmoos-related-torah";
		this.root.hidden = true;
		this.root.setAttribute("aria-label", "Related Torah");
		this._loadTimer = null;
		this._loadToken = 0;
		this._onRetry = null;
		ensureStyle();
		ensureExtraStyle();
	}

	loading(onRetry) {
		this.root.hidden = false;
		const token = ++this._loadToken;
		this.clearLoadTimer();
		this._onRetry = typeof onRetry === "function" ? onRetry : null;
		this.root.replaceChildren(headerNode(), messageNode("Finding related Torah sources…"));
		// The search may hang without ever resolving or rejecting (dropped socket,
		// unavailable connection): never leave the loader spinning forever.
		this._loadTimer = setTimeout(() => {
			if (this._loadToken !== token) {
				return;
			}
			this._loadTimer = null;
			this.error("Related Torah is taking too long to load right now.");
		}, RelatedTorahView.LOAD_TIMEOUT_MS);
	}

	render(sources) {
		this.clearLoadTimer();
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
		this.clearLoadTimer();
		this.root.hidden = false;
		this.root.replaceChildren(headerNode());
		const wrap = document.createElement("div");
		wrap.appendChild(messageNode(message));
		if (this._onRetry) {
			const retry = document.createElement("button");
			retry.type = "button";
			retry.className = "awtsmoos-related-torah-retry";
			retry.textContent = "Try again";
			retry.addEventListener("click", () => {
				const fn = this._onRetry;
				this._onRetry = null;
				this.loading(fn);
				fn();
			});
			wrap.appendChild(retry);
		}
		this.root.appendChild(wrap);
	}

	clearLoadTimer() {
		if (this._loadTimer) {
			clearTimeout(this._loadTimer);
			this._loadTimer = null;
		}
	}

	sourceCard(source) {
		const card = document.createElement("article");
		card.className = "awtsmoos-related-torah-card";
		const title = document.createElement("strong");
		title.textContent = source.title || "Torah source";
		const reference = document.createElement("small");
		reference.textContent = source.reference || "";
		const excerpt = document.createElement("p");
		const fullExcerpt = String(source.excerpt || "").replace(/\s+/g, " ").trim();
		const { display, truncated } = cleanExcerpt(fullExcerpt, EXCERPT_CHARS);
		if (!truncated) {
			excerpt.textContent = fullExcerpt;
		} else {
			// Server excerpts may end mid-word; the collapsed view always ends at a
			// clean sentence boundary, and Read more reveals everything received.
			excerpt.append(document.createTextNode(`${display} `), this.readMoreToggle(excerpt, fullExcerpt, display));
		}
		card.append(title, reference, excerpt);
		const href = safeHref(source.href);
		if (href) {
			card.appendChild(this.sourceLink(source, href));
		}
		return card;
	}

	readMoreToggle(excerptNode, full, collapsed) {
		const button = document.createElement("button");
		button.type = "button";
		button.className = "awtsmoos-related-torah-readmore";
		button.textContent = "Read more";
		button.setAttribute("aria-expanded", "false");
		button.addEventListener("click", () => {
			const expanded = button.getAttribute("aria-expanded") !== "true";
			button.setAttribute("aria-expanded", String(expanded));
			button.textContent = expanded ? "Show less" : "Read more";
			excerptNode.replaceChildren(document.createTextNode(`${expanded ? full : collapsed} `), button);
		});
		return button;
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

function ensureExtraStyle() {
	if (document.getElementById(EXTRA_STYLE_ID)) {
		return;
	}
	const style = document.createElement("style");
	style.id = EXTRA_STYLE_ID;
	style.textContent = `
.awtsmoos-related-torah-readmore {
	padding: 0;
	border: 0;
	background: none;
	color: inherit;
	font: inherit;
	font-weight: 700;
	text-decoration: underline;
	text-underline-offset: 2px;
	cursor: pointer;
	opacity: .9;
}
.awtsmoos-related-torah-readmore:hover { opacity: 1; }
.awtsmoos-related-torah-readmore:focus-visible { outline: 2px solid currentColor; outline-offset: 2px; }
.awtsmoos-related-torah-retry {
	margin-top: .6rem;
	min-block-size: 2.75rem;
	padding: .5rem 1rem;
	border: 1px solid currentColor;
	border-radius: 999px;
	background: none;
	color: inherit;
	font: inherit;
	font-weight: 700;
	cursor: pointer;
}
.awtsmoos-related-torah-retry:focus-visible { outline: 2px solid currentColor; outline-offset: 2px; }`;
	document.head.appendChild(style);
}
