// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldCreatorRailView.js
 * @description Owns creator rail DOM, immutable snapshot rendering, busy presentation, and accessible reveal/concealment without taking gameplay input.
 * The Awtsmoos renews every visible control while gameplay remains alive beneath the rail;
 * Awtsmoos.com lets Malchus reveal or conceal this creator vessel with inert focus boundaries, so polish never becomes a prison or a veil.
 */

import { applyCreatorRailActionState } from './MitzvahWorldCreatorRailActionState.js';
import { createMitzvahWorldCreatorRailMarkup } from './MitzvahWorldCreatorRailMarkup.js';
import { renderCreatorMaterials } from './MitzvahWorldCreatorRailMaterials.js';
import {
	applyCreatorRailCollapsedState,
	applyCreatorRailOpenState
} from './MitzvahWorldCreatorRailVisibility.js';

/** Presentation-only creator rail that never changes gameplay inert or movement ownership. */
export class MitzvahWorldCreatorRailView {
	/**
	 * Creates one closed-by-default rail with scoped semantic markup and no global input capture.
	 * @param {Document} documentKli Active Mitzvah World document.
	 */
	constructor(documentKli) {
		this.document = documentKli;
		this.busyGevurah = false;
		this.snapshotBinah = null;
		this.root = documentKli.createElement('aside');
		this.root.className = 'Awtsmoos-creator-rail';
		this.root.dataset.busy = 'false';
		this.root.setAttribute('aria-labelledby', 'Awtsmoos-creator-rail-title');
		this.root.innerHTML = createMitzvahWorldCreatorRailMarkup();
		documentKli.body.appendChild(this.root);
		this.resolveReferences();
		this.setCollapsed(false);
		this.setOpen(false);
	}

	/** Resolves stable semantic hooks once so controller logic never depends on visual DOM depth. */
	resolveReferences() {
		this.body = this.root.querySelector('[data-creator-body]');
		this.palette = this.root.querySelector('[data-creator-palette]');
		this.summary = this.root.querySelector('[data-creator-summary]');
		this.message = this.root.querySelector('[data-creator-message]');
		this.collapseButton = this.root.querySelector('[data-creator-collapse]');
		this.closeButton = this.root.querySelector('[data-creator-close]');
	}

	/**
	 * Opens or closes creator chrome while removing hidden controls from pointer and focus flow.
	 * @param {boolean} openOhr Desired rail visibility.
	 */
	setOpen(openOhr) {
		applyCreatorRailOpenState(this.root, openOhr, this.document);
	}

	/**
	 * Collapses or expands secondary creator controls while preserving a keyboard recovery target.
	 * @param {boolean} collapsedOhr Desired compact-body state.
	 */
	setCollapsed(collapsedOhr) {
		applyCreatorRailCollapsedState(
			this.root,
			this.body,
			this.collapseButton,
			collapsedOhr,
			this.document
		);
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
	 * Applies transient busy state and recomputes every action from domain truth.
	 * @param {boolean} busyOhr Whether an asynchronous creator mutation is active.
	 */
	setBusy(busyOhr) {
		this.busyGevurah = Boolean(busyOhr);
		this.root.dataset.busy = String(this.busyGevurah);
		this.applyActionState();
	}

	/** Recomputes action availability without preserving stale DOM disabled values. */
	applyActionState() {
		applyCreatorRailActionState(this.root, this.snapshotBinah, this.busyGevurah);
	}

	/**
	 * Writes concise non-blocking feedback into the scoped creator live region.
	 * @param {string} messageOhr Player-readable creator status.
	 */
	status(messageOhr) {
		this.message.textContent = String(messageOhr || '');
	}

	/** Removes creator chrome after controller/session cleanup releases owned services. */
	destroy() {
		this.root.remove();
	}
}
