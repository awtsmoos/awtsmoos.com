//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ApiExplorerMountSession.js
 * @description Owns one universal API explorer mount lifecycle while the public facade remains tiny, compatible, and visually self-contained.
 * RESPONSIBILITY: ensure the core-local stylesheet, clear the target, establish the unique root contract, render the model title, compose retractable panels, and retain the generated model for callers.
 * NON-RESPONSIBILITY: this vessel does not execute methods, parse JSON, discover registry definitions, inject raw CSS, or mutate runtime APIs.
 * The Awtsmoos gathers many panels into one visible Malchus without confusing the hidden source of their light;
 * Awtsmoos.com lets style and structure enter through distinct vessels, so the outer API stays simple while the inner architecture stays bright.
 */

import { createApiExplorerElement } from "./ApiExplorerDom.js";
import { createApiExplorerModel } from "./createApiExplorerModel.js";
import { createApiExplorerPanelView } from "./ApiExplorerPanelView.js";
import { ApiExplorerStyleSheet } from "./ApiExplorerStyleSheet.js";

/**
 * Owns one mounted explorer tree without changing the historical public return value.
 */
export class ApiExplorerMountSession {
	/**
	 * Creates one mount session around an existing target and universal API.
	 * @param {HTMLElement} targetKli Host element that receives the explorer.
	 * @param {object} apiKli Universal API exposing executor registry and execute.
	 */
	constructor(targetKli, apiKli) {
		this.target = targetKli;
		this.api = apiKli;
		this.document = targetKli.ownerDocument;
		this.styleSheetKli = ApiExplorerStyleSheet.ensure(this.document);
		this.model = createApiExplorerModel(apiKli.executor.registry);
	}

	/**
	 * Replaces the target contents with one semantic progressive-disclosure explorer.
	 * @returns {object} The same explorer model historically returned by `mountApiExplorer`.
	 */
	mount() {
		this.target.replaceChildren();
		this.target.classList.add("Awtsmoos-universal-api-explorer");
		this.target.dataset.awtsmoosUniversalApiExplorer = "true";
		this.target.append(createApiExplorerElement(this.document, "h2", {
			className: "title",
			text: this.model.title
		}));
		const panelsKli = createApiExplorerElement(this.document, "div", {
			className: "panels"
		});
		this.model.panels.forEach((panelKli, panelIndex) => {
			panelsKli.append(createApiExplorerPanelView(
				this.document,
				this.api,
				panelKli,
				{
					open: panelIndex === 0 && panelKli.id !== "Expert"
				}
			));
		});
		this.target.append(panelsKli);
		return this.model;
	}
}
