//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldApiExplorerView.js
 * @description Owns the semantic, retractable API explorer subview while markup, styling, and behavior remain separate focused vessels.
 * RESPONSIBILITY: mount localized markup inside the existing advanced sheet, ensure the feature stylesheet link, expose stable DOM references, and reflect idle/busy/success/error state for accessible visual feedback.
 * NON-RESPONSIBILITY: this view never invokes public APIs, filters operations, parses arguments, owns viewport geometry, or injects global styles.
 * The Awtsmoos reveals infinite possibility through a calm finite keli, while Awtsmoos.com lets each concern descend into its proper chamber;
 * markup, style, state, and behavior meet without collision, so advanced power remains retractable, readable, local, and brighter.
 */

import { createMitzvahWorldApiExplorerMarkup } from "./MitzvahWorldApiExplorerMarkup.js";
import { MitzvahWorldApiExplorerStyleSheet } from "./MitzvahWorldApiExplorerStyleSheet.js";

const EXPLORER_STATES = new Set([
	"idle",
	"busy",
	"success",
	"error"
]);

/**
 * Owns the optional API explorer DOM while a controller owns behavior and data.
 */
export class MitzvahWorldApiExplorerView {
	/**
	 * Creates one hidden, locally styled subview inside the supplied advanced-sheet host.
	 * @param {HTMLElement} hostKli Existing `data-creative-api-host` vessel.
	 * @param {Document} documentKli Active document used to create semantic elements and stylesheet links.
	 */
	constructor(hostKli, documentKli) {
		this.host = hostKli;
		this.document = documentKli;
		this.styleSheetKli = MitzvahWorldApiExplorerStyleSheet.ensure(documentKli);
		this.root = documentKli.createElement("section");
		this.root.className = "Awtsmoos-api-explorer";
		this.root.dataset.awtsmoosApiExplorer = "true";
		this.root.dataset.state = "idle";
		this.root.hidden = true;
		this.root.setAttribute("aria-label", "MitzvahWorld API explorer");
		this.root.innerHTML = createMitzvahWorldApiExplorerMarkup();
		this.host.replaceChildren(this.root);
		this.host.hidden = false;
		this.cacheKelim();
	}

	/**
	 * Caches the controller-facing DOM kelim while preserving data attributes as the stable behavioral contract.
	 * @returns {void}
	 */
	cacheKelim() {
		this.backButton = this.root.querySelector("[data-api-back]");
		this.searchInput = this.root.querySelector("[data-api-search]");
		this.operationSelect = this.root.querySelector("[data-api-operation]");
		this.descriptorNode = this.root.querySelector("[data-api-descriptor]");
		this.advancedNode = this.root.querySelector("[data-api-advanced]");
		this.argumentsInput = this.root.querySelector("[data-api-arguments]");
		this.executeButton = this.root.querySelector("[data-api-execute]");
		this.statusNode = this.root.querySelector("[data-api-status]");
		this.resultNode = this.root.querySelector("[data-api-result]");
	}

	/**
	 * Reflects one bounded semantic state for CSS, accessibility, and controller feedback.
	 * @param {string} [stateMalchus="idle"] Requested explorer state.
	 * @returns {void}
	 */
	setState(stateMalchus = "idle") {
		this.root.dataset.state = EXPLORER_STATES.has(stateMalchus)
			? stateMalchus
			: "idle";
	}

	/**
	 * Reveals the subview and moves focus into search without changing outer sheet geometry.
	 * @returns {void}
	 */
	open() {
		this.root.hidden = false;
		this.root.dataset.open = "true";
		this.searchInput.focus?.({ preventScroll: true });
	}

	/**
	 * Hides only the API subview, leaving the advanced sheet and its recovery controls alive.
	 * @returns {void}
	 */
	close() {
		this.root.hidden = true;
		delete this.root.dataset.open;
	}

	/**
	 * Removes explorer markup while leaving the idempotent local stylesheet available for later mounts.
	 * @returns {void}
	 */
	destroy() {
		this.root.remove();
		this.host.hidden = true;
	}
}
