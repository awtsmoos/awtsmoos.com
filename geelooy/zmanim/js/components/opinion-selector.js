//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos is One while a user may compare many lawful vessels without surrendering the first screen to controls;
 * Awtsmoos.com keeps selection native, primary meaning explicit, and the full method universe one disclosure away beneath compact mobile rules.
 */

import {
	allSupportedOpinionIds,
	normalizeOpinionIds,
	normalizePrimaryOpinion
} from "../config/opinion-selection.js";
import {
	renderOpinionChoice,
	renderOpinionSummary,
	renderOpinionToolbar
} from "./opinion-selector-renderer.js";

/** Accessible multi-opinion selector with a responsive disclosure and one primary calculation. */
export class AwtsmoosOpinionSelector extends HTMLElement {
	constructor() {
		super();
		this.opinionIds = ["chabad"];
		this.primaryOpinionId = "chabad";
		this.detailsOpen = null;
		this.boundChange = event => this.handleChange(event);
		this.boundClick = event => this.handleClick(event);
	}

	set data(value) {
		const opinionIds = normalizeOpinionIds(value?.opinionIds || value?.opinionId);
		this.opinionIds = opinionIds;
		this.primaryOpinionId = normalizePrimaryOpinion(
			value?.primaryOpinionId || value?.opinionId,
			opinionIds
		);
		if (this.isConnected) {
			this.render();
		}
	}

	connectedCallback() {
		this.addEventListener("change", this.boundChange);
		this.addEventListener("click", this.boundClick);
		this.render();
	}

	disconnectedCallback() {
		this.removeEventListener("change", this.boundChange);
		this.removeEventListener("click", this.boundClick);
	}

	/** Handle one native checkbox change without allowing the selection to become empty. */
	handleChange(event) {
		const checkbox = event.target.closest("input[data-opinion-check]");
		if (checkbox) {
			this.toggleOpinion(checkbox.dataset.opinionCheck, checkbox.checked);
		}
	}

	/** Handle bulk-selection and primary-method buttons outside checkbox-label semantics. */
	handleClick(event) {
		const action = event.target.closest("button[data-opinion-action]")?.dataset.opinionAction;
		const primary = event.target.closest("button[data-primary-opinion]")?.dataset.primaryOpinion;
		if (action === "all") {
			this.commit(allSupportedOpinionIds(), this.primaryOpinionId);
		} else if (action === "chabad") {
			this.commit(["chabad"], "chabad");
		} else if (primary) {
			this.commit(this.opinionIds, primary);
		}
	}

	/** Add or remove one opinion while guaranteeing at least one remains selected. */
	toggleOpinion(opinionId, selected) {
		const nextIds = selected
			? [...this.opinionIds, opinionId]
			: this.opinionIds.filter(id => id !== opinionId);
		this.commit(nextIds.length ? nextIds : this.opinionIds, this.primaryOpinionId);
	}

	/** Normalize, rerender, and announce one complete comparison-selection transaction. */
	commit(opinionIds, primaryOpinionId) {
		this.opinionIds = normalizeOpinionIds(opinionIds);
		this.primaryOpinionId = normalizePrimaryOpinion(primaryOpinionId, this.opinionIds);
		this.render();
		this.dispatchEvent(new CustomEvent("opinion-selection-change", {
			bubbles: true,
			detail: {
				opinionIds: [...this.opinionIds],
				primaryOpinionId: this.primaryOpinionId
			}
		}));
	}

	/** Rebuild the disclosure while preserving the user's explicit open or closed state. */
	render() {
		const details = document.createElement("details");
		details.className = "opinion-disclosure";
		details.open = this.detailsOpen ?? matchMedia("(min-width: 720px)").matches;
		details.append(renderOpinionSummary(this.opinionIds, this.primaryOpinionId));
		const choices = document.createElement("div");
		choices.className = "opinion-choices";
		choices.setAttribute("aria-label", "Supported calculation methods");
		for (const opinionId of allSupportedOpinionIds()) {
			choices.append(renderOpinionChoice(opinionId, this.opinionIds, this.primaryOpinionId));
		}
		const body = document.createElement("div");
		body.className = "opinion-disclosure-body";
		body.append(choices);
		details.append(body);
		details.addEventListener("toggle", () => {
			this.detailsOpen = details.open;
		});
		this.replaceChildren(details, renderOpinionToolbar());
	}
}

customElements.define("awtsmoos-opinion-selector", AwtsmoosOpinionSelector);
