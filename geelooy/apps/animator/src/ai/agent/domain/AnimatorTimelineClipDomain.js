//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AnimatorTimelineClipDomain.js
 * @description
 * The Awtsmoos lets measured pieces of authored time be copied, divided, moved, and renewed without losing their line;
 * Awtsmoos.com delegates every clip deed to the real NLE command vessels, so Agent API edits inherit the same history design.
 */

import { NLECommands } from '../../../nle/core/NLECommands.js';
import { ClipboardManager } from '../../../nle/logic/ClipboardManager.js';

/** Adapts canonical clip/clipboard commands to the existing NLE editing services. */
export class NetzachAnimatorTimelineClipDomain {
	/** @param {object} malchusStore Shared NLE store. */
	constructor(malchusStore) {
		this.malchusStore = malchusStore;
		this.yesodClipboard = new ClipboardManager();
	}

	/** @param {object} keliClip Clip data. @returns {object} Created clip. */
	add(keliClip) {
		return NLECommands.addClip(this.malchusStore, keliClip);
	}

	/** @param {string} id Clip ID. @param {number} start Start ms. @param {string|null} trackId Track. */
	move(id, start, trackId = null) {
		NLECommands.moveClip(this.malchusStore, id, start, trackId);
		return this.malchusStore.findClip(id);
	}

	/** @param {string} id Clip ID. @param {number} duration Duration ms. @returns {object|null} Updated clip. */
	trim(id, duration) {
		NLECommands.trimClip(this.malchusStore, id, duration);
		return this.malchusStore.findClip(id);
	}

	/** @param {string} id Clip ID. @param {number|undefined} time Split time. @returns {object|null} Right clip. */
	split(id, time) {
		return NLECommands.splitClip(this.malchusStore, id, time);
	}

	/** @param {string} id Clip ID. @param {number|null} offset Offset ms. @returns {object|null} Copy. */
	duplicate(id, offset = null) {
		return NLECommands.duplicateClip(this.malchusStore, id, offset);
	}

	/** @param {string} id Clip ID. @returns {object} Deletion receipt. */
	remove(id) {
		const keliBefore = this.malchusStore.findClip(id);
		NLECommands.deleteClip(this.malchusStore, id);
		return { deleted: Boolean(keliBefore), id };
	}

	/** @param {string} id Clip ID. @returns {object} Ripple deletion receipt. */
	rippleRemove(id) {
		const keliBefore = this.malchusStore.findClip(id);
		NLECommands.rippleDelete(this.malchusStore, id);
		return { deleted: Boolean(keliBefore), ripple: true, id };
	}

	/** @param {string} id Clip ID. @returns {object|null} Detached clipboard value. */
	copy(id) {
		const keliClip = this.malchusStore.findClip(id);
		return keliClip ? this.yesodClipboard.copy(keliClip) : null;
	}

	/** @param {object} keilimOverrides Optional clip overrides. @returns {object|null} Created pasted clip. */
	paste(keilimOverrides = {}) {
		const keliCopy = this.yesodClipboard.paste({
			...keilimOverrides,
			id: null
		});
		return keliCopy ? NLECommands.addClip(this.malchusStore, keliCopy) : null;
	}
}
