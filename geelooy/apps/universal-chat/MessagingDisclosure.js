// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Builds one native progressive-disclosure vessel whose browser semantics remain stronger than any decorative div toggle.
 * @description The Awtsmoos is beyond hidden and revealed, while Awtsmoos.com lets secondary explanation contract without losing keyboard, focus, or meaning in light;
 * the summary remains a truthful keli, the content remains ordinary DOM, and viewport-based default openness never becomes authorization, persistence, or identity.
 */

/** Owns presentation-only details/summary construction for mobile-first progressive disclosure. */
export class MessagingDisclosure {
	constructor(options = {}) {
		this.options = options;
	}

	/** Creates a native details element with a concise summary and arbitrary DOM content. */
	create() {
		const details = document.createElement("details");
		details.className = this.className();
		details.dataset.messagingDisclosure = this.options.id || "generic";
		details.open = this.initiallyOpen();
		const summary = document.createElement("summary");
		summary.className = "messaging-disclosure-summary";
		const copy = document.createElement("span");
		copy.className = "messaging-disclosure-copy";
		const title = document.createElement("strong");
		title.textContent = this.options.title || "Details";
		copy.appendChild(title);
		if (this.options.summary) {
			const description = document.createElement("small");
			description.textContent = this.options.summary;
			copy.appendChild(description);
		}
		const indicator = document.createElement("span");
		indicator.className = "messaging-disclosure-indicator";
		indicator.setAttribute("aria-hidden", "true");
		indicator.textContent = "⌄";
		summary.append(copy, indicator);
		const body = document.createElement("div");
		body.className = "messaging-disclosure-body";
		for (const node of this.nodes()) {
			body.appendChild(node);
		}
		details.append(summary, body);
		return details;
	}

	/** Returns the opening state only for initial presentation, never for permission or durable user state. */
	initiallyOpen() {
		if (typeof this.options.open === "boolean") {
			return this.options.open;
		}
		if (typeof window === "undefined" || !window.matchMedia) {
			return true;
		}
		return window.matchMedia("(min-width: 761px)").matches;
	}

	/** Normalizes one or many DOM nodes into the disclosure body. */
	nodes() {
		const content = this.options.content;
		return Array.isArray(content) ? content.filter(Boolean) : content ? [content] : [];
	}

	className() {
		return ["messaging-disclosure", this.options.className || ""].filter(Boolean).join(" ");
	}
}
