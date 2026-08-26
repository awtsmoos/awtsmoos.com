//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AnimatorTimelineEditorDomain.js
 * @description
 * The Awtsmoos lets gaze, transform, keyframe, track state, and playhead move as distinct editor vessels in time;
 * Awtsmoos.com preserves the line between durable edits and transient workspace state, keeping Agent and UI behavior in rhyme.
 */

import { NLECommands } from '../../../nle/core/NLECommands.js';

/** Adapts timeline inspection and editor-state commands to the canonical NLE store. */
export class HodAnimatorTimelineEditorDomain {
	/** @param {object} malchusStore Shared NLE store. */
	constructor(malchusStore) {
		this.malchusStore = malchusStore;
	}

	/** @returns {object} Detached timeline snapshot without private services. */
	snapshot() {
		const malchusState = this.malchusStore.get();
		return structuredClone({
			playhead: malchusState.playhead,
			duration: malchusState.duration,
			snap: malchusState.snap,
			selectedClipId: malchusState.selectedClipId,
			selectedEntityId: malchusState.selectedEntityId,
			tracks: malchusState.tracks ?? [],
			clips: malchusState.clips ?? [],
			keyframes: malchusState.keyframes ?? []
		});
	}

	/** @param {string} id Clip ID. @param {string} property Channel. @param {number} value Value. @returns {object|null} Updated clip. */
	updateTransform(id, property, value) {
		NLECommands.updateTransform(this.malchusStore, id, property, value);
		return this.malchusStore.findClip(id);
	}

	/** @param {string} id Clip ID. @param {number|undefined} time Time ms. @returns {object|null} Keyframe. */
	addTransformKeyframe(id, time) {
		return NLECommands.addTransformKeyframe(this.malchusStore, id, time);
	}

	/** @param {string|null} id Clip identity. @returns {object} Selection receipt. */
	selectClip(id = null) {
		NLECommands.selectClip(this.malchusStore, id);
		return { selectedClipId: this.malchusStore.get().selectedClipId };
	}

	/** @param {string|null} id Entity identity. @returns {object} Selection receipt. */
	selectEntity(id = null) {
		NLECommands.selectEntity(this.malchusStore, id);
		return { selectedEntityId: this.malchusStore.get().selectedEntityId };
	}

	/** @param {number} milliseconds Absolute playhead time. @returns {object} Renewed time state. */
	scrub(milliseconds) {
		NLECommands.scrub(this.malchusStore, milliseconds);
		const malchusState = this.malchusStore.get();
		return { playhead: malchusState.playhead, duration: malchusState.duration };
	}

	/** @param {string} id Track ID. @param {'muted'|'locked'} property Track property. @returns {object|null} Updated track. */
	toggleTrack(id, property) {
		NLECommands.toggleTrack(this.malchusStore, id, property);
		return this.malchusStore.get().tracks.find((keliTrack) => keliTrack.id === id) ?? null;
	}
}
