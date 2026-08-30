//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file MitzvahWorldCreatorRailView.js
 * @description Owns creator rail DOM, immutable snapshot rendering, nearby-vs-total world counts, busy presentation, and accessible reveal/concealment.
 * The Awtsmoos remembers every authored form even when distant meshes return to concealment from sight;
 * Awtsmoos.com therefore names total semantic objects beside nearby residents so streaming feels like a vast world, never data taking flight.
 */

import { creatorMaterialQuantityLabel } from './MitzvahWorldCreatorMaterialQuantity.js';
import { applyCreatorRailActionState } from './MitzvahWorldCreatorRailActionState.js';
import { createMitzvahWorldCreatorRailMarkup } from './MitzvahWorldCreatorRailMarkup.js';
import { renderCreatorMaterials } from './MitzvahWorldCreatorRailMaterials.js';
import { applyCreatorRailCollapsedState, applyCreatorRailOpenState } from './MitzvahWorldCreatorRailVisibility.js';

export class MitzvahWorldCreatorRailView {
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

	resolveReferences() {
		this.body = this.root.querySelector('[data-creator-body]');
		this.palette = this.root.querySelector('[data-creator-palette]');
		this.summary = this.root.querySelector('[data-creator-summary]');
		this.message = this.root.querySelector('[data-creator-message]');
		this.collapseButton = this.root.querySelector('[data-creator-collapse]');
		this.closeButton = this.root.querySelector('[data-creator-close]');
	}

	setOpen(openOhr) {
		applyCreatorRailOpenState(this.root, openOhr, this.document);
	}

	setCollapsed(collapsedOhr) {
		applyCreatorRailCollapsedState(this.root, this.body, this.collapseButton, collapsedOhr, this.document);
	}

	render(snapshotBinah) {
		this.snapshotBinah = snapshotBinah;
		renderCreatorMaterials(this.palette, snapshotBinah);
		const materialOhr = creatorMaterialQuantityLabel(snapshotBinah.materialQuantity);
		const totalOhr = Number(snapshotBinah.indexed ?? snapshotBinah.mounted ?? 0);
		const nearbyOhr = Number(snapshotBinah.mounted ?? 0);
		this.summary.textContent = `${materialOhr} materials · ${totalOhr} objects · ${nearbyOhr} nearby`;
		this.root.dataset.hasMaterial = String(snapshotBinah.materialQuantity > 0);
		this.applyActionState();
	}

	setBusy(busyOhr) {
		this.busyGevurah = Boolean(busyOhr);
		this.root.dataset.busy = String(this.busyGevurah);
		this.applyActionState();
	}

	applyActionState() {
		applyCreatorRailActionState(this.root, this.snapshotBinah, this.busyGevurah);
	}

	status(messageOhr) {
		this.message.textContent = String(messageOhr || '');
	}

	destroy() {
		this.root.remove();
	}
}
