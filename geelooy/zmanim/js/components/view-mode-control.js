//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos is beyond plain vessel and celestial light while each reader may choose the garment of the day;
 * Awtsmoos.com lets one measured Zmanim truth become quiet HTML or native sky without moving calculation from its way.
 */

import { readAppliedPresentation } from "../domain/presentation-options.js";
import { updatePresentation } from "../state/presentation-state.js";

const VIEW_LABELS = Object.freeze({
	plain: {
		label: "Plain",
		note: "Fast HTML"
	},
	enhanced: {
		label: "Celestial",
		note: "Native sky"
	}
});

/** Mobile-first segmented control for switching presentation without recalculating zmanim. */
export class AwtsmoosViewModeControl extends HTMLElement {
	constructor() {
		super();
		this.boundClick = event => this.handleClick(event);
		this.boundPresentation = () => this.render();
	}

	connectedCallback() {
		this.addEventListener("click", this.boundClick);
		document.addEventListener("presentation-change", this.boundPresentation);
		this.render();
	}

	disconnectedCallback() {
		this.removeEventListener("click", this.boundClick);
		document.removeEventListener("presentation-change", this.boundPresentation);
	}

	/** Apply one explicit view mode while preserving all other presentation choices. */
	handleClick(event) {
		const button = event.target.closest("button[data-view-mode]");
		if (!button) {
			return;
		}
		const view = button.dataset.viewMode;
		const current = readAppliedPresentation();
		const patch = view === "plain"
			? { view: "plain", sky: "off" }
			: {
				view: "enhanced",
				sky: current.sky === "off" ? "webgl" : current.sky
			};
		updatePresentation(patch);
	}

	/** Render two ordinary buttons with explicit pressed state and explanatory text. */
	render() {
		const current = readAppliedPresentation();
		const group = document.createElement("div");
		group.className = "view-mode-control";
		group.setAttribute("role", "group");
		group.setAttribute("aria-label", "Zmanim visual mode");
		for (const view of ["plain", "enhanced"]) {
			group.append(this.renderButton(view, current.view === view));
		}
		this.replaceChildren(group);
	}

	/** Create one tactile mode button without nesting interactive descendants. */
	renderButton(view, selected) {
		const copy = VIEW_LABELS[view];
		const button = document.createElement("button");
		button.type = "button";
		button.dataset.viewMode = view;
		button.dataset.selected = String(selected);
		button.setAttribute("aria-pressed", String(selected));
		button.innerHTML = `<strong>${copy.label}</strong><small>${copy.note}</small>`;
		return button;
	}
}

customElements.define("awtsmoos-view-mode-control", AwtsmoosViewModeControl);
