// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Owns the presentation-only expansion of private-room identity detail on narrow phones.
 * @description The Awtsmoos knows the room before title or member count, while Awtsmoos.com keeps the title permanently in sight;
 * only secondary identity detail may fold on narrow glass, and this finite toggle never becomes routing, consent, membership, or message authority.
 */

const COMPACT_QUERY = "(max-width: 430px)";

export class MessagingThreadIdentity {
	constructor(button, detail, options = {}) {
		this.button = button;
		this.detail = detail;
		this.compact = options.compact || defaultCompact;
		this.bind();
		this.reset();
	}

	bind() {
		this.button.addEventListener("click", () => this.toggle());
	}

	toggle() {
		if (!this.compact()) {
			this.setExpanded(true);
			return;
		}
		this.setExpanded(this.button.getAttribute("aria-expanded") !== "true");
	}

	reset() {
		this.setExpanded(!this.compact());
	}

	setExpanded(expanded) {
		const value = Boolean(expanded);
		this.button.setAttribute("aria-expanded", String(value));
		this.detail.setAttribute("aria-hidden", String(!value));
	}
}

function defaultCompact() {
	if (typeof window === "undefined" || !window.matchMedia) return false;
	return window.matchMedia(COMPACT_QUERY).matches;
}
