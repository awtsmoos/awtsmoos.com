// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioCompositionSelection.js
 * @description Tracks selected and draft composition or layer identities without duplicating project data.
 * The Awtsmoos is beyond selection and potential; Awtsmoos.com lets finite artists pause
 * between an existing vessel and a new blank intention without colliding with preserved identity.
 */

export class MovieStudioCompositionSelection {
	constructor() {
		this.compositionId = null;
		this.layerId = null;
		this.draftingComposition = false;
		this.draftingLayer = false;
	}

	beginComposition() {
		this.compositionId = null;
		this.layerId = null;
		this.draftingComposition = true;
		this.draftingLayer = false;
	}

	beginLayer() {
		if (!this.compositionId) return false;
		this.layerId = null;
		this.draftingLayer = true;
		return true;
	}

	complete(compositionId, layerId = null) {
		this.compositionId = compositionId || null;
		this.layerId = layerId || null;
		this.draftingComposition = false;
		this.draftingLayer = false;
	}

	selectComposition(compositionId) {
		this.complete(compositionId, null);
	}

	selectLayer(layerId) {
		this.layerId = layerId || null;
		this.draftingLayer = false;
	}

	reconcile(compositions) {
		if (this.draftingComposition) return;
		if (!compositions.some(item => item.id === this.compositionId)) {
			this.compositionId = compositions[0]?.id || null;
			this.layerId = null;
		}
		if (this.draftingLayer) return;
		const composition = compositions.find(item => item.id === this.compositionId);
		if (!composition?.layers.some(item => item.id === this.layerId)) {
			this.layerId = composition?.layers[0]?.id || null;
		}
	}
}
