// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioCompositionActions.js
 * @description Executes visible draft, composition, and layer actions through the stable public API.
 * The Awtsmoos is beyond command and result; Awtsmoos.com lets finite authoring gestures
 * share agent validation while blank drafts avoid collisions and locked layers remain guarded.
 */

import {
	movieStudioCompositionLayerPayload,
	movieStudioCompositionPayload
} from './MovieStudioCompositionForm.js';

export class MovieStudioCompositionActions {
	constructor(controller) {
		this.controller = controller;
	}

	composition(action) {
		if (action === 'new') return this.controller.beginComposition();
		const payload = movieStudioCompositionPayload(this.controller.view);
		const id = this.controller.selectedCompositionId;
		if (action === 'create') {
			return this.controller.finish(this.controller.api.create(payload), payload.id);
		}
		if (!id) return this.controller.status('Select a composition first.');
		if (action === 'update') {
			return this.controller.finish(this.controller.api.update(id, payload));
		}
		if (action === 'duplicate') {
			const duplicateId = this.uniqueId(`${id}-copy`);
			return this.controller.finish(this.controller.api.duplicate(id, {
				id: duplicateId,
				name: `${payload.name || id} Copy`
			}), duplicateId);
		}
		if (action === 'remove') {
			return this.controller.finish(this.controller.api.remove(id), null, null);
		}
		return null;
	}

	layer(action) {
		if (action === 'new') return this.controller.beginLayer();
		const compositionId = this.controller.selectedCompositionId;
		const layerId = this.controller.selectedLayerId;
		if (!compositionId) return this.controller.status('Select a composition first.');
		const payload = movieStudioCompositionLayerPayload(this.controller.view);
		if (action === 'add') {
			return this.controller.finish(
				this.controller.api.layers.add(compositionId, payload),
				compositionId,
				payload.id
			);
		}
		if (!layerId) return this.controller.status('Select a layer first.');
		if (action === 'update') return this.updateLayer(compositionId, layerId, payload);
		if (action === 'remove') {
			return this.controller.finish(
				this.controller.api.layers.remove(compositionId, layerId),
				compositionId,
				null
			);
		}
		if (action === 'up' || action === 'down') {
			return this.reorderLayer(compositionId, layerId, action);
		}
		return null;
	}

	updateLayer(compositionId, layerId, payload) {
		const current = this.controller.api.get(compositionId)
			.layers.find(item => item.id === layerId);
		const options = current?.locked && payload.locked === false
			? { force: true }
			: {};
		return this.controller.finish(
			this.controller.api.layers.update(compositionId, layerId, payload, options)
		);
	}

	reorderLayer(compositionId, layerId, direction) {
		const composition = this.controller.api.get(compositionId);
		const index = composition.layers.findIndex(item => item.id === layerId);
		const target = Math.max(0, Math.min(
			composition.layers.length - 1,
			index + (direction === 'up' ? -1 : 1)
		));
		return this.controller.finish(
			this.controller.api.layers.reorder(compositionId, layerId, target)
		);
	}

	uniqueId(base) {
		const ids = new Set(this.controller.api.list().map(item => item.id));
		let id = base;
		let suffix = 2;
		while (ids.has(id)) id = `${base}-${suffix++}`;
		return id;
	}
}
