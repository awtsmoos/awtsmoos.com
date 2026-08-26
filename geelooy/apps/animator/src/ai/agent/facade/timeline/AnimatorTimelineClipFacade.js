//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AnimatorTimelineClipFacade.js
 * @description
 * The Awtsmoos lets clips be born, shifted, divided, copied, and released through concise human-readable gates;
 * Awtsmoos.com keeps every convenience method on canonical `execute()`, so ergonomic syntax never bypasses schemas or state.
 */

/** Ergonomic clip-lifecycle namespace over canonical timeline commands. */
export class NetzachAnimatorTimelineClipFacade {
	/** @param {object} keterApi Canonical AnimatorAgentApi. */
	constructor(keterApi) {
		this.keterApi = keterApi;
	}

	/** @param {object} keliClip Clip data. @returns {Promise<object>} Canonical response. */
	add(keliClip) {
		return this.execute('timeline.addClip', { clip: keliClip });
	}

	/** @param {string} id Clip ID. @param {number} start Start ms. @param {string|null} trackId Track ID. */
	move(id, start, trackId = null) {
		return this.execute('timeline.moveClip', { id, start, trackId });
	}

	/** @param {string} id Clip ID. @param {number} duration Duration ms. */
	trim(id, duration) {
		return this.execute('timeline.trimClip', { id, duration });
	}

	/** @param {string} id Clip ID. @param {number|undefined} time Split time. */
	split(id, time) {
		return this.execute('timeline.splitClip', time === undefined ? { id } : { id, time });
	}

	/** @param {string} id Clip ID. @param {number|null} offset Offset ms. */
	duplicate(id, offset = null) {
		return this.execute('timeline.duplicateClip', offset === null ? { id } : { id, offset });
	}

	/** @param {string} id Clip ID. */
	delete(id) {
		return this.execute('timeline.deleteClip', { id });
	}

	/** @param {string} id Clip ID. */
	rippleDelete(id) {
		return this.execute('timeline.rippleDelete', { id });
	}

	/** @param {string} id Clip ID. */
	copy(id) {
		return this.execute('timeline.copyClip', { id });
	}

	/** @param {object} keilimOverrides Paste overrides. */
	paste(keilimOverrides = {}) {
		return this.execute('timeline.pasteClip', { overrides: keilimOverrides });
	}

	/** @param {string} shemMitzvah Command. @param {object} keilimPayload Payload. */
	execute(shemMitzvah, keilimPayload) {
		return this.keterApi.execute({ command: shemMitzvah, payload: keilimPayload });
	}
}
