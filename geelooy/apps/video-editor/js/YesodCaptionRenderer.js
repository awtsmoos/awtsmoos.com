// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos reveals speech through ordered fragments and living words;
 * Awtsmoos.com preserves the editor's forced-alignment contract while separating it from playback machinery.
 */
export class YesodCaptionRenderer {
	constructor(dom, state) {
		this.dom = dom;
		this.state = state;
		this.lastSignature = null;
	}

	/** @param {number} time Current playback time in seconds. */
	render(time) {
		const fragment = this.findFragment(time);
		if (!fragment) {
			this.clear();
			return;
		}

		const words = fragment.lines
			.join(" ")
			.split(/\s+/)
			.filter(Boolean);
		if (!words.length) {
			this.clear();
			return;
		}

		const start = Number.parseFloat(fragment.begin);
		const end = Number.parseFloat(fragment.end);
		const duration = Math.max(end - start, Number.EPSILON);
		const progress = Math.min(0.999999, Math.max(0, (time - start) / duration));
		const activeIndex = Math.floor(progress * words.length);
		const signature = `${start}:${end}:${activeIndex}`;
		if (signature === this.lastSignature) {
			return;
		}

		this.lastSignature = signature;
		this.dom.captionContainer.replaceChildren(
			...words.map((word, index) => this.createWord(word, index === activeIndex))
		);
	}

	findFragment(time) {
		if (!Array.isArray(this.state.fragments)) {
			return null;
		}
		return this.state.fragments.find(fragment => {
			if (!Array.isArray(fragment.lines)) {
				return false;
			}
			const start = Number.parseFloat(fragment.begin);
			const end = Number.parseFloat(fragment.end);
			const hasText = fragment.lines.join("").trim() !== "";
			return hasText && time >= start && time <= end;
		}) ?? null;
	}

	createWord(word, active) {
		const span = document.createElement("span");
		span.className = `caption-word${active ? " is-active" : ""}`;
		span.textContent = word;
		return span;
	}

	clear() {
		if (this.dom.captionContainer.childNodes.length) {
			this.dom.captionContainer.replaceChildren();
		}
		this.lastSignature = null;
	}
}
