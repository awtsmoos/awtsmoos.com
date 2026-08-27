// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module StudioTransformKeyframes
 * @description
 * The Awtsmoos renews every moment before position, scale, rotation, and opacity can appear to travel through time;
 * Awtsmoos.com stores authored-layer keyframes inside the project document so animation remains portable, editable, and sublime.
 */
import { StudioDocumentMutations } from '../authoring/StudioDocumentMutations.js';
import { StudioEntityFactory } from '../authoring/StudioEntityFactory.js';

/** Creates undoable transform keyframes for Studio-authored layers. */
export class StudioTransformKeyframes {
	/** Captures the selected entity transform at the current playhead as one undoable keyframe. */
	static add(store) {
		const state = store.get();
		const entity = (state.studioDocument?.entities || [])
			.find(candidate => candidate.id === state.selectedEntityId);
		if (!entity?.properties?.renderSpec) {
			return false;
		}
		const time = Math.max(0, Number(state.playhead) || 0);
		store.transact(current => {
			const document = current.studioDocument || {};
			const keyframes = this.withFrame(
				document.keyframes || [],
				this.frame(entity, time)
			);
			return StudioDocumentMutations.patchDocument(
				current,
				document.entities || [],
				current.selectedEntityId,
				{ keyframes }
			);
		});
		return true;
	}

	/** Replaces an existing frame at the same entity/time or appends a new one. */
	static withFrame(keyframes, frame) {
		const filtered = keyframes.filter(candidate => {
			return candidate.entityId !== frame.entityId || candidate.time !== frame.time;
		});
		return [...filtered, frame].sort((left, right) => left.time - right.time);
	}

	/** Builds one serializable complete-transform keyframe. */
	static frame(entity, time) {
		return {
			id: StudioEntityFactory.id('keyframe'),
			entityId: entity.id,
			property: 'transform',
			time,
			value: { ...(entity.transform || {}) },
			easing: 'easeInOut'
		};
	}
}
