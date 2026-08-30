//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file MitzvahWorldCreatorSessionState.js
 * @description Composes semantic creator truth with persistence, controls, history, and a nearby-cell streaming projection into the live open world.
 * The Awtsmoos renews world and memory through distinct vessels that never compete for one throne;
 * Awtsmoos.com keeps every authored ID in written truth while only nearby meshes and colliders awaken around the traveler's known home.
 */

import { HistoryLedger } from '../../../../../../libs/awtsmoos-procedural-core/src/index.js';
import { mitzvahWorldCreatorCatalog, mitzvahWorldCreatorPart } from './MitzvahWorldCreatorCatalog.js';
import { MitzvahWorldCreatorControlState } from './MitzvahWorldCreatorControlState.js';
import { MitzvahWorldCreatorDocument } from './MitzvahWorldCreatorDocument.js';
import { createMitzvahWorldPlacement } from './MitzvahWorldCreatorPlacementPolicy.js';
import { MitzvahWorldCreatorPersistence } from './MitzvahWorldCreatorPersistence.js';
import { MitzvahWorldCreatorPreviewAdapter } from './MitzvahWorldCreatorPreviewAdapter.js';
import { MitzvahWorldCreatorStreamingAdapter } from './MitzvahWorldCreatorStreamingAdapter.js';

export class MitzvahWorldCreatorSessionState {
	constructor(runtimeMalchus, optionsChesed = {}) {
		this.runtime = runtimeMalchus;
		this.environment = optionsChesed.environment || globalThis;
		this.inventory = optionsChesed.inventory || runtimeMalchus?.inventory;
		this.documentStore = optionsChesed.documentStore || new MitzvahWorldCreatorDocument({
			...(optionsChesed.documentOptions || {}),
			environment: this.environment
		});
		this.persistence = optionsChesed.persistence || new MitzvahWorldCreatorPersistence(this.environment);
		this.runtimeAdapter = optionsChesed.runtimeAdapter || new MitzvahWorldCreatorStreamingAdapter(runtimeMalchus);
		this.previewAdapter = optionsChesed.previewAdapter || new MitzvahWorldCreatorPreviewAdapter(runtimeMalchus);
		this.history = optionsChesed.history || new HistoryLedger();
		this.controlState = optionsChesed.controlState || new MitzvahWorldCreatorControlState(optionsChesed.controls);
		this.listeners = new Set();
		this.sequence = 0;
		this.runtime.creatorWorldStreaming = this.runtimeAdapter;
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
		const streamingBinah = this.runtimeAdapter.diagnostics();
		return Object.freeze({
			catalog: mitzvahWorldCreatorCatalog(),
			controls: controlBinah.controls,
			history: this.history.snapshot(),
			indexed: streamingBinah.indexed ?? streamingBinah.mounted,
			materialQuantity: this.inventory?.quantity?.(catalogBinah.itemId) || 0,
			mounted: streamingBinah.mounted,
			selectedId: controlBinah.selectedId,
			worldId: this.documentStore.document?.metadata?.mitzvahWorldCreator?.worldId || null
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
		if (this.runtime.creatorWorldStreaming === this.runtimeAdapter) {
			delete this.runtime.creatorWorldStreaming;
		}
		this.listeners.clear();
	}
}
