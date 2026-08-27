// B"H
// Boruch Hashem
// Blessed is He

import { StudioDocumentMutations } from '../authoring/StudioDocumentMutations.js';
import { StudioVectorPathFactory } from './StudioVectorPathFactory.js';

/**
 * @file StudioVectorPathStyleService.js
 * @description
 * The Awtsmoos renews color, width, cap, join, and closure before a path can wear its visible garment;
 * Awtsmoos.com updates the selected canonical render spec so inspector, history, preview, and export behold the same art.
 */
export class StudioVectorPathStyleService {
	/** Updates stroke color on one real selected vector path. */
	static stroke(store, value) {
		return this.update(store, (spec) => ({ ...spec, stroke: this.color(value, spec.stroke || '#7db4ff') }));
	}

	/** Enables or disables path fill while preserving a useful fallback color. */
	static fillEnabled(store, enabled) {
		return this.update(store, (spec) => ({
			...spec,
			fill: enabled ? this.color(spec.fill, '#6ea8ff') : null
		}));
	}

	/** Updates the current fill color and therefore enables fill explicitly. */
	static fill(store, value) {
		return this.update(store, (spec) => ({ ...spec, fill: this.color(value, '#6ea8ff') }));
	}

	/** Updates renderer-supported path stroke width. */
	static width(store, value) {
		return this.update(store, (spec) => ({
			...spec,
			lineWidth: StudioVectorPathFactory.width(value)
		}));
	}

	/** Updates Canvas2D line-cap semantics. */
	static cap(store, value) {
		return this.update(store, (spec) => ({ ...spec, lineCap: StudioVectorPathFactory.cap(value) }));
	}

	/** Updates Canvas2D line-join semantics. */
	static join(store, value) {
		return this.update(store, (spec) => ({ ...spec, lineJoin: StudioVectorPathFactory.join(value) }));
	}

	/** Opens or closes the path using production renderer close-path behavior. */
	static closed(store, value) {
		return this.update(store, (spec) => ({ ...spec, close: Boolean(value) }));
	}

	/** Applies one guarded render-spec edit without replacing entity identity or transform. */
	static update(store, mapper) {
		const state = store.get();
		const selected = (state.studioDocument?.entities || []).find((entity) => {
			return entity.id === state.selectedEntityId;
		});
		if (selected?.type !== 'vector-path' || selected.properties?.renderSpec?.type !== 'path') {
			return false;
		}
		return StudioDocumentMutations.updateSelected(store, (entity) => ({
			...entity,
			properties: {
				...(entity.properties || {}),
				renderSpec: mapper(entity.properties.renderSpec)
			}
		}));
	}

	/** Accepts six-digit CSS hex colors and falls back without injecting arbitrary CSS. */
	static color(value, fallback) {
		const candidate = String(value || '');
		return /^#[0-9a-f]{6}$/iu.test(candidate) ? candidate : fallback;
	}
}
