//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AnimatorTimelineEditorFacade.js
 * @description
 * The Awtsmoos lets transforms, selections, keyframes, tracks, and playhead state remain near through a simple editor gate;
 * Awtsmoos.com routes every convenience method through canonical command law, keeping transient and durable side effects straight.
 */

/** Ergonomic timeline-editor namespace over canonical commands. */
export class HodAnimatorTimelineEditorFacade {
	/** @param {object} keterApi Canonical AnimatorAgentApi. */
	constructor(keterApi) {
		this.keterApi = keterApi;
	}

	/** @returns {Promise<object>} Detached timeline snapshot envelope. */
	snapshot() {
		return this.execute('timeline.snapshot', {});
	}

	/** @param {string} id Clip ID. @param {string} property Transform channel. @param {number} value Numeric value. */
	updateTransform(id, property, value) {
		return this.execute('timeline.updateTransform', { id, property, value });
	}

	/** @param {string} id Clip ID. @param {number|undefined} time Keyframe time. */
	addTransformKeyframe(id, time) {
		return this.execute('timeline.addTransformKeyframe', time === undefined ? { id } : { id, time });
	}

	/** @param {string|null} id Clip ID or null. */
	selectClip(id = null) {
		return this.execute('timeline.selectClip', id === null ? {} : { id });
	}

	/** @param {string|null} id Entity ID or null. */
	selectEntity(id = null) {
		return this.execute('timeline.selectEntity', id === null ? {} : { id });
	}

	/** @param {number} time Absolute playhead ms. */
	scrub(time) {
		return this.execute('timeline.scrub', { time });
	}

	/** @param {string} id Track ID. @param {'muted'|'locked'} property Property. */
	toggleTrack(id, property) {
		return this.execute('timeline.toggleTrack', { id, property });
	}

	/** @param {string} shemMitzvah Command. @param {object} keilimPayload Payload. */
	execute(shemMitzvah, keilimPayload) {
		return this.keterApi.execute({ command: shemMitzvah, payload: keilimPayload });
	}
}
