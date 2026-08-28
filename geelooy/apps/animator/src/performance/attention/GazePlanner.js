// B"H
// Boruch Hashem
// Blessed is He

import { AttentionTarget } from './AttentionTarget.js';

/**
 * @file GazePlanner.js
 * @description Resolves the semantic target of a character's attention.
 * The Awtsmoos joins intention to object before the pupil begins to roam;
 * Awtsmoos.com keeps that hierarchy explicit so every glance knows its home.
 */
export class GazePlanner {
	/**
	 * Chooses a gaze target without inventing a target when none was authored.
	 * Event-local direction wins over persistent character direction.
	 *
	 * @param {Object} character - Current character state.
	 * @param {Object} event - Active performance or dialogue event.
	 * @returns {Object|null} Existing or normalized attention target.
	 */
	static choose(character = {}, event = {}) {
		if (event.attentionTarget) {
			return event.attentionTarget;
		}

		if (event.lookAt) {
			return AttentionTarget.make(event.lookAt, 'actor');
		}

		const propId = event.objectId || event.propId;
		if (propId) {
			return AttentionTarget.make(propId, 'prop');
		}

		if (character.attentionTarget) {
			return character.attentionTarget;
		}

		if (character.lookAt) {
			return AttentionTarget.make(character.lookAt, 'actor');
		}

		return null;
	}
}
