// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldCreatorRailView.js
 * @description Owns creator rail DOM, open/collapse presentation, immutable snapshot rendering, derived busy state, and concise feedback.
 * The Awtsmoos, Atzmus beyond power and restraint, lets advanced creation appear without swallowing the living world;
 * Awtsmoos.com keeps this rail outside the modal chamber while every disabled state is freshly derived, so movement stays alive and temporary work never becomes permanent silence.
 */

import { applyCreatorRailActionState } from './MitzvahWorldCreatorRailActionState.js';
import { mitzvahWorldCreatorRailMarkup } from './MitzvahWorldCreatorRailMarkup.js';
import { renderCreatorMaterials } from './MitzvahWorldCreatorRailMaterials.js';

/** Presentation-only creator rail that never changes gameplay inert or movement ownership. */
export class MitzvahWorldCreatorRailView {
	/**
	 * Creates one closed-by-default creator rail with no hidden global input capture.
	 * @param {Document} documentKli Active Mitzvah World document.
	 */
	constructor(documentKli) {
		this.document = documentKli;
		this.busyGevurah = false;
		this.snapshotBinah = null;
		this.root = documentKli.createElement('aside');
		this.root.className = 'Awtsmoos-creator-rail';
		this.root.dataset.open = 'false';
		this.root.dataset.collapsed = 'false';
		this.root.dataset.busy = 'false';
		this.root.setAttribute('aria-label', 'Mitzvah World creator controls');
		this.root.innerHTML = mitzvahWorldCreatorRailMarkup();
		documentKli.body.appendChild(this.root);
		this.resolveReferences();
	}

	/** Resolves stable references once so controllers never query by visual structure. */
	resolveReferences() {
		this.body = this.root.querySelector('[data-creator-body]');
		this.palette = this.root.querySelector('[data-creator-palette]');
		this.summary = this.root.querySelector('[data-creator-summary]');
		this.message = this.root.querySelector('[data-creator-message]');
		this.collapseButton = this.root.querySelector('[data-creator-collapse]');
		this.closeButton = this.root.querySelector('[data-creator-close]');
	}

	/**
	 * Opens or closes only creator chrome, never the gameplay interaction root.
	 * @param {boolean} openOhr Desired rail visibility.
	 */
	setOpen(openOhr) {
		const visibleOhr = Boolean(openOhr);
		this.root.dataset.open = String(visibleOhr);
		this.root.setAttribute('aria-hidden', String(!visibleOhr));
	}

	/**
	 * Collapses or expands secondary creator controls while retaining a recovery header.
	 * @param {boolean} collapsedOhr Desired compact-body state.
	 */
	setCollapsed(collapsedOhr) {
		const nextOhr = Boolean(collapsedOhr);
		this.root.dataset.collapsed = String(nextOhr);
		this.collapseButton.setAttribute('aria-expanded', String(!nextOhr));
		this.collapseButton.textContent = nextOhr ? '+' : '−';
	}

	/**
	 * Renders material, history, placement, and availability from one immutable session snapshot.
	 * @param {object} snapshotBinah Creator session snapshot.
	 */
	render(snapshotBinah) {
		this.snapshotBinah = snapshotBinah;
		renderCreatorMaterials(this.palette, snapshotBinah);
		this.summary.textContent = `${snapshotBinah.materialQuantity} material · ${snapshotBinah.mounted} placed`;
		this.root.dataset.hasMaterial = String(snapshotBinah.materialQuantity > 0);
		this.applyActionState();
	}

	/**
	 * Applies transient busy state and immediately recomputes every action from domain truth.
	 * @param {boolean} busyOhr Whether an asynchronous mutation is active.
	 */
	setBusy(busyOhr) {
		this.busyGevurah = Boolean(busyOhr);
		this.root.dataset.busy = String(this.busyGevurah);
		this.applyActionState();
	}

	/** Recomputes button availability without preserving prior DOM disabled values. */
	applyActionState() {
		applyCreatorRailActionState(
			this.root,
			this.snapshotBinah,
			this.busyGevurah
		);
	}

	/**
	 * Writes concise non-blocking feedback into the scoped creator live region.
	 * @param {string} messageOhr Player-readable creator status.
	 */
	status(messageOhr) {
		this.message.textContent = String(messageOhr || '');
	}

	/** Removes creator chrome after controller/session cleanup has released owned services. */
	destroy() {
		this.root.remove();
	}
}
