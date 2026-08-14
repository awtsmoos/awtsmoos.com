//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos is one while shitos give the measured day distinct lawful vessels;
 * Awtsmoos.com keeps switching compact, keyboard-complete, and free of repeated explanatory levels.
 */

import { ZMANIM_OPINIONS } from "../config/opinions.js";

const SHORT_LABELS = Object.freeze({
	chabad: "Chabad",
	gra: "Gra",
	magenAvraham72: "M.A. 72"
});

/** Compact accessible shita radiogroup synchronized with the native fallback select. */
export class AwtsmoosOpinionSelector extends HTMLElement {
	set value(opinionId) {
		this.opinionId = opinionId;
		if (this.isConnected) this.render();
	}

	get value() {
		return this.opinionId || "chabad";
	}

	connectedCallback() {
		this.opinionId = this.opinionId || "chabad";
		this.render();
		this.addEventListener("click", event => {
			const button = event.target.closest("button[data-opinion]");
			if (button) this.selectOpinion(button.dataset.opinion, false);
		});
		this.addEventListener("keydown", event => {
			this.handleKeydown(event);
		});
	}

	handleKeydown(event) {
		const button = event.target.closest("button[data-opinion]");
		const keys = ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"];
		if (!button || !keys.includes(event.key)) return;
		event.preventDefault();
		const buttons = Array.from(this.querySelectorAll("button[data-opinion]"));
		const currentIndex = buttons.indexOf(button);
		let nextIndex = currentIndex;
		if (event.key === "Home") nextIndex = 0;
		else if (event.key === "End") nextIndex = buttons.length - 1;
		else {
			const forward = event.key === "ArrowRight" || event.key === "ArrowDown";
			nextIndex = (currentIndex + (forward ? 1 : -1) + buttons.length) % buttons.length;
		}
		this.selectOpinion(buttons[nextIndex].dataset.opinion, true);
	}

	selectOpinion(opinionId, restoreFocus) {
		this.opinionId = opinionId;
		this.render();
		this.dispatchEvent(new CustomEvent("opinion-change", {
			bubbles: true,
			detail: { opinionId }
		}));
		if (restoreFocus) this.querySelector(`[data-opinion="${opinionId}"]`)?.focus();
	}

	render() {
		this.replaceChildren();
		const group = document.createElement("div");
		group.className = "opinion-segments";
		group.setAttribute("role", "radiogroup");
		group.setAttribute("aria-label", "Calculation method");
		for (const opinion of Object.values(ZMANIM_OPINIONS)) {
			group.append(this.createButton(opinion));
		}
		this.append(group);
	}

	createButton(opinion) {
		const selected = opinion.id === this.value;
		const button = document.createElement("button");
		button.type = "button";
		button.dataset.opinion = opinion.id;
		button.setAttribute("role", "radio");
		button.setAttribute("aria-checked", String(selected));
		button.setAttribute("aria-label", opinion.label);
		button.tabIndex = selected ? 0 : -1;
		button.textContent = SHORT_LABELS[opinion.id] || opinion.label;
		if (selected) button.dataset.selected = "";
		return button;
	}
}

customElements.define("awtsmoos-opinion-selector", AwtsmoosOpinionSelector);
