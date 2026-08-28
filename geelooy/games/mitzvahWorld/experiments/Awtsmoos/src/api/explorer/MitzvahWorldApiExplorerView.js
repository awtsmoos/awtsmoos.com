// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldApiExplorerView.js
 * @description Owns the semantic retractable observatory DOM while markup, localized styles, selection, execution, and responsive host geometry remain separate vessels.
 * The Awtsmoos reveals infinite possibility through a calm finite keli while Awtsmoos.com lets each concern descend into its proper chamber,
 * so search, domain, metadata, status, arguments, and receipts meet without collision and the same view remains readable by keyboard, touch, screen reader, and future agent alike.
 */
import { createMitzvahWorldApiExplorerMarkup } from './MitzvahWorldApiExplorerMarkup.js';
import { MitzvahWorldApiExplorerStyleSheet } from './MitzvahWorldApiExplorerStyleSheet.js';

const EXPLORER_STATES = new Set(['idle', 'busy', 'success', 'error']);

/** Owns the optional API explorer DOM while a controller owns behavior and data. */
export class MitzvahWorldApiExplorerView {
	constructor(keterHost, chochmahDocument) {
		this.host = keterHost;
		this.document = chochmahDocument;
		this.styleSheetKli = MitzvahWorldApiExplorerStyleSheet.ensure(chochmahDocument);
		this.root = chochmahDocument.createElement('section');
		this.root.className = 'Awtsmoos-api-explorer';
		this.root.dataset.awtsmoosApiExplorer = 'true';
		this.root.dataset.state = 'idle';
		this.root.dataset.executable = 'false';
		this.root.hidden = true;
		this.root.setAttribute('aria-label', 'MitzvahWorld Reality and API explorer');
		this.root.innerHTML = createMitzvahWorldApiExplorerMarkup();
		this.host.replaceChildren(this.root);
		this.host.hidden = false;
		this.cacheKelim();
	}

	/** Caches the controller-facing local DOM contract. */
	cacheKelim() {
		this.backButton = this.root.querySelector('[data-api-back]');
		this.searchInput = this.root.querySelector('[data-api-search]');
		this.domainSelect = this.root.querySelector('[data-api-domain]');
		this.operationSelect = this.root.querySelector('[data-api-operation]');
		this.countNode = this.root.querySelector('[data-api-count]');
		this.descriptorNode = this.root.querySelector('[data-api-descriptor]');
		this.advancedNode = this.root.querySelector('[data-api-advanced]');
		this.argumentsInput = this.root.querySelector('[data-api-arguments]');
		this.executeButton = this.root.querySelector('[data-api-execute]');
		this.statusNode = this.root.querySelector('[data-api-status]');
		this.resultNode = this.root.querySelector('[data-api-result]');
	}

	/** Reflects one bounded semantic state for CSS and assistive technology. */
	setState(keterState = 'idle') {
		this.root.dataset.state = EXPLORER_STATES.has(keterState) ? keterState : 'idle';
	}

	/** Reveals the local subview and places focus in capability search. */
	open() {
		this.root.hidden = false;
		this.root.dataset.open = 'true';
		this.searchInput.focus?.({ preventScroll: true });
	}

	/** Hides only the API subview while the parent advanced sheet remains alive. */
	close() {
		this.root.hidden = true;
		delete this.root.dataset.open;
	}

	/** Removes explorer markup while retaining the idempotent stylesheet for future mounts. */
	destroy() {
		this.root.remove();
		this.host.hidden = true;
	}
}
