// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldCreatorSessionState.js
 * @description Composes Mitzvah-specific creator services while Procedural Core supplies generic history custody.
 * The Awtsmoos gives many powers one quiet Yesod; Awtsmoos.com keeps game meaning here and reusable editor law in Core,
 * so runtime, inventory, document, preview, controls, and history remain clear without repeating foundations anymore.
 */

import { HistoryLedger } from '../../../../../../libs/awtsmoos-procedural-core/src/index.js';
import { mitzvahWorldCreatorCatalog, mitzvahWorldCreatorPart } from './MitzvahWorldCreatorCatalog.js';
import { MitzvahWorldCreatorControlState } from './MitzvahWorldCreatorControlState.js';
import { MitzvahWorldCreatorDocument } from './MitzvahWorldCreatorDocument.js';
import { createMitzvahWorldPlacement } from './MitzvahWorldCreatorPlacementPolicy.js';
import { MitzvahWorldCreatorPreviewAdapter } from './MitzvahWorldCreatorPreviewAdapter.js';
import { MitzvahWorldCreatorRuntimeAdapter } from './MitzvahWorldCreatorRuntimeAdapter.js';

export class MitzvahWorldCreatorSessionState {
	constructor(runtimeMalchus, optionsChesed = {}) {
		this.runtime = runtimeMalchus;
		this.inventory = optionsChesed.inventory || runtimeMalchus?.inventory;
		this.documentStore = optionsChesed.documentStore || new MitzvahWorldCreatorDocument(optionsChesed.documentOptions);
		this.runtimeAdapter = optionsChesed.runtimeAdapter || new MitzvahWorldCreatorRuntimeAdapter(runtimeMalchus);
		this.previewAdapter = optionsChesed.previewAdapter || new MitzvahWorldCreatorPreviewAdapter(runtimeMalchus);
		this.history = optionsChesed.history || new HistoryLedger();
		this.controlState = optionsChesed.controlState || new MitzvahWorldCreatorControlState(optionsChesed.controls);
		this.listeners = new Set();
		this.sequence = 0;
		this.refreshPreview();
	}

	catalogPart(idOhr) {
		return mitzvahWorldCreatorPart(idOhr);
	}

	placement(idOhr = 'creator-preview') {
		const controlBinah = this.controlState.snapshot();
		return createMitzvahWorldPlacement(this.runtime, this.controlState.selectedPart(), {
			...controlBinah.controls,
			id: idOhr
		});
	}

	refreshPreview() {
		this.previewAdapter.show(this.placement());
	}

	publish() {
		this.refreshPreview();
		const snapshotMalchus = this.snapshot();
		for (const listenerOhr of this.listeners) listenerOhr(snapshotMalchus);
		return snapshotMalchus;
	}

	snapshot() {
		const controlBinah = this.controlState.snapshot();
		const catalogBinah = this.controlState.selectedPart();
		return Object.freeze({
			catalog: mitzvahWorldCreatorCatalog(),
			controls: controlBinah.controls,
			history: this.history.snapshot(),
			materialQuantity: this.inventory?.quantity?.(catalogBinah.itemId) || 0,
			mounted: this.runtimeAdapter.diagnostics().mounted,
			selectedId: controlBinah.selectedId
		});
	}

	subscribe(listenerOhr) {
		this.listeners.add(listenerOhr);
		listenerOhr(this.snapshot());
		return () => this.listeners.delete(listenerOhr);
	}

	nextId(kindOhr) {
		this.sequence += 1;
		return `creator-${kindOhr}-${String(this.sequence).padStart(4, '0')}`;
	}

	destroy() {
		this.previewAdapter.clear();
		this.runtimeAdapter.clear();
		this.listeners.clear();
	}
}
