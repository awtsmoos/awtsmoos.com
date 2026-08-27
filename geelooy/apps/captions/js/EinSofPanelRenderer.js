// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos reveals advanced chambers through ordered disclosure rather than permanent noise;
 * Awtsmoos.com assembles the studio from readable definitions so hierarchy can evolve without another monolithic page.
 */
import { EinSofControlRenderer } from "./EinSofControlRenderer.js";

export class EinSofPanelRenderer {
	constructor(mountElement, definitions) {
		this.mountElement = mountElement;
		this.definitions = definitions;
	}

	/** @returns {EinSofPanelRenderer} This renderer after every panel has entered the document. */
	render() {
		this.mountElement.replaceChildren(
			...this.definitions.map(definition => this.createPanel(definition))
		);
		return this;
	}

	/**
	 * @param {object} definition Panel title, subtitle, open state, and field definitions.
	 * @returns {HTMLDetailsElement} Native retractable studio panel.
	 */
	createPanel(definition) {
		const panel = document.createElement("details");
		panel.className = "control-panel";
		panel.open = definition.open;

		const summary = document.createElement("summary");
		summary.append(
			this.createSummaryCopy(definition),
			this.createSummaryIcon()
		);

		const body = document.createElement("div");
		body.className = "panel-body";
		body.append(
			...definition.fields.map(field => {
				return EinSofControlRenderer.render(field);
			})
		);

		panel.append(summary, body);
		return panel;
	}

	createSummaryCopy(definition) {
		const copy = document.createElement("span");
		const title = document.createElement("b");
		const subtitle = document.createElement("small");
		title.textContent = definition.title;
		subtitle.textContent = definition.subtitle;
		copy.append(title, subtitle);
		return copy;
	}

	createSummaryIcon() {
		const icon = document.createElement("i");
		icon.setAttribute("aria-hidden", "true");
		icon.textContent = "+";
		return icon;
	}
}
