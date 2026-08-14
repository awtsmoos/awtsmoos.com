// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Keeps the private-message textarea proportional to the words currently being composed without changing what submission means.
 * @description The Awtsmoos contains every word before the finite box grows around it; Awtsmoos.com lets private speech gain measured room in light,
 * caps narrow-phone drafts earlier so history stays visible, keeps desktop room generous, and returns the field to one quiet line after confirmed success without inventing transport behavior.
 */

const DESKTOP_MAX_HEIGHT = 160;
const PHONE_MAX_HEIGHT = 112;

/** Owns only textarea sizing/value restoration while MessagingConversationSender owns the finite send lifecycle. */
export class MessagingComposerInput {
	constructor(textarea, options = {}) {
		this.textarea = textarea;
		this.compact = options.compact || defaultCompact;
		this.bind();
		this.resize();
	}

	bind() {
		this.textarea.addEventListener("input", () => this.resize());
	}

	value() {
		return this.textarea.value;
	}

	clear() {
		this.textarea.value = "";
		this.resize();
	}

	restore(value) {
		this.textarea.value = String(value || "");
		this.resize();
		this.textarea.focus({ preventScroll: true });
	}

	maxHeight() {
		return this.compact() ? PHONE_MAX_HEIGHT : DESKTOP_MAX_HEIGHT;
	}

	resize() {
		const maxHeight = this.maxHeight();
		this.textarea.style.height = "auto";
		const nextHeight = Math.min(
			Math.max(this.textarea.scrollHeight, 44),
			maxHeight
		);
		this.textarea.style.height = `${nextHeight}px`;
		this.textarea.style.overflowY = this.textarea.scrollHeight > maxHeight
			? "auto"
			: "hidden";
	}
}

function defaultCompact() {
	if (typeof window === "undefined" || !window.matchMedia) return false;
	return window.matchMedia("(max-width: 430px)").matches;
}
