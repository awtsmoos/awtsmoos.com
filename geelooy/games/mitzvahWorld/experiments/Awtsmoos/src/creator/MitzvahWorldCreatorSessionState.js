// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldCreatorSessionState.js
 * @description Owns creator service composition, preview publication, immutable snapshots, and stable session-local identities.
 * The Awtsmoos gives many powers one quiet Yesod; Awtsmoos.com keeps runtime, inventory, document, preview,
 * history, and pure controls composed here so action subclasses may move without repeating the foundations of light.
 */

import { mitzvahWorldCreatorCatalog, mitzvahWorldCreatorPart } from './MitzvahWorldCreatorCatalog.js';
import { MitzvahWorldCreatorControlState } from './MitzvahWorldCreatorControlState.js';
import { MitzvahWorldCreatorDocument } from './MitzvahWorldCreatorDocument.js';
import { MitzvahWorldCreatorHistory } from './MitzvahWorldCreatorHistory.js';
import { createMitzvahWorldPlacement } from './MitzvahWorldCreatorPlacementPolicy.js';
import { MitzvahWorldCreatorPreviewAdapter } from './MitzvahWorldCreatorPreviewAdapter.js';
import { MitzvahWorldCreatorRuntimeAdapter } from './MitzvahWorldCreatorRuntimeAdapter.js';

/** Foundational creator state inherited by the action and public session layers. */
export class MitzvahWorldCreatorSessionState {
	/** Creates one composed state vessel from the already-running Mitzvah World runtime. */
	constructor(runtimeMalchus, optionsChesed = {}) {
		this.runtime = runtimeMalchus;
		this.inventory = optionsChesed.inventory || runtimeMalchus?.inventory;
		this.documentStore = optionsChesed.documentStore || new MitzvahWorldCreatorDocument(optionsChesed.documentOptions);
		this.runtimeAdapter = optionsChesed.runtimeAdapter || new MitzvahWorldCreatorRuntimeAdapter(runtimeMalchus);
		this.previewAdapter = optionsChesed.previewAdapter || new MitzvahWorldCreatorPreviewAdapter(runtimeMalchus);
		this.history = optionsChesed.history || new MitzvahWorldCreatorHistory();
		this.controlState = optionsChesed.controlState || new MitzvahWorldCreatorControlState(optionsChesed.controls);
		this.listeners = new Set();
		this.sequence = 0;
		this.refreshPreview();
	}

	/** Resolves one immutable catalog entry through the shared creator vocabulary. */
	catalogPart(idOhr) {
		return mitzvahWorldCreatorPart(idOhr);
	}

	/** Creates the current snapped primitive from live runtime plus pure control state. */
	placement(idOhr = 'creator-preview') {
		const controlBinah = this.controlState.snapshot();
		return createMitzvahWorldPlacement(this.runtime, this.controlState.selectedPart(), {
			...controlBinah.controls,
			id: idOhr
		});
	}

	/** Replaces only the non-colliding scene preview without committing canonical data. */
	refreshPreview() {
		this.previewAdapter.show(this.placement());
	}

	/** Refreshes the ghost and notifies every subscribed view with immutable state. */
	publish() {
		this.refreshPreview();
		const snapshotMalchus = this.snapshot();
		for (const listenerOhr of this.listeners) {
			listenerOhr(snapshotMalchus);
		}
		return snapshotMalchus;
	}

	/** Returns immutable UI-facing creator state without exposing mutable service internals. */
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

	/** Subscribes one view immediately and returns an explicit unsubscribe function. */
	subscribe(listenerOhr) {
		this.listeners.add(listenerOhr);
		listenerOhr(this.snapshot());
		return () => this.listeners.delete(listenerOhr);
	}

	/** Allocates one stable session-local resource identity for parts and courses. */
	nextId(kindOhr) {
		this.sequence += 1;
		return `creator-${kindOhr}-${String(this.sequence).padStart(4, '0')}`;
	}

	/** Releases creator preview/live geometry and subscriber references without touching native world objects. */
	destroy() {
		this.previewAdapter.clear();
		this.runtimeAdapter.clear();
		this.listeners.clear();
	}
}
