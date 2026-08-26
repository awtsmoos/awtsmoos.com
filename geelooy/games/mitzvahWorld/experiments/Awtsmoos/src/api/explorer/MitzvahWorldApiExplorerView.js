// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldApiExplorerView.js
 * @description Builds the semantic, retractable API subview inside the existing advanced sheet without owning viewport geometry or public API behavior.
 * The Awtsmoos hides infinite possibility behind one finite opening, while Awtsmoos.com gives search, arguments, execution, and result their ordered kelim;
 * no second floating button is born, no panel escapes the sheet, and every advanced command remains present only when deliberately revealed within.
 */

const EXPLORER_MARKUP = `
	<header class="Awtsmoos-api-explorer__header">
		<div class="Awtsmoos-api-explorer__title"><small>Data-first API</small><strong>World observatory</strong></div>
		<button type="button" class="Awtsmoos-api-explorer__back" data-api-back aria-label="Close API explorer">Done</button>
	</header>
	<label class="Awtsmoos-api-explorer__field">
		<span>Find operation</span>
		<input type="search" data-api-search autocomplete="off" placeholder="runtime, tree, house, texture…">
	</label>
	<label class="Awtsmoos-api-explorer__field">
		<span>Operation</span>
		<select data-api-operation aria-label="API operation"></select>
	</label>
	<div class="Awtsmoos-api-explorer__descriptor" data-api-descriptor aria-live="polite"></div>
	<label class="Awtsmoos-api-explorer__field">
		<span>Arguments · JSON array</span>
		<textarea data-api-arguments rows="3" spellcheck="false">[]</textarea>
	</label>
	<div class="Awtsmoos-api-explorer__command-row">
		<button type="button" class="Awtsmoos-api-explorer__execute" data-api-execute>Execute</button>
		<output data-api-status aria-live="polite">Choose an operation.</output>
	</div>
	<pre class="Awtsmoos-api-explorer__result" data-api-result tabindex="0" aria-label="API result">No result yet.</pre>
`;

/** Owns the optional API explorer DOM while a controller owns behavior and data. */
export class MitzvahWorldApiExplorerView {
	/**
	 * Creates one hidden subview inside the supplied advanced-sheet host.
	 * @param {HTMLElement} hostKli Existing `data-creative-api-host` vessel.
	 * @param {Document} documentKli Active document used to create semantic elements.
	 */
	constructor(hostKli, documentKli) {
		this.host = hostKli;
		this.document = documentKli;
		this.root = documentKli.createElement('section');
		this.root.className = 'Awtsmoos-api-explorer';
		this.root.dataset.awtsmoosApiExplorer = 'true';
		this.root.hidden = true;
		this.root.setAttribute('aria-label', 'MitzvahWorld API explorer');
		this.root.innerHTML = EXPLORER_MARKUP;
		this.host.replaceChildren(this.root);
		this.host.hidden = false;
		this.backButton = this.root.querySelector('[data-api-back]');
		this.searchInput = this.root.querySelector('[data-api-search]');
		this.operationSelect = this.root.querySelector('[data-api-operation]');
		this.descriptorNode = this.root.querySelector('[data-api-descriptor]');
		this.argumentsInput = this.root.querySelector('[data-api-arguments]');
		this.executeButton = this.root.querySelector('[data-api-execute]');
		this.statusNode = this.root.querySelector('[data-api-status]');
		this.resultNode = this.root.querySelector('[data-api-result]');
	}

	/**
	 * Reveals the subview and moves focus into search without changing outer sheet geometry.
	 * @returns {void}
	 */
	open() {
		this.root.hidden = false;
		this.root.dataset.open = 'true';
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

	/** Removes explorer markup from the host without removing the advanced sheet itself. */
	destroy() {
		this.root.remove();
		this.host.hidden = true;
	}
}
