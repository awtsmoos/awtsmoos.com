// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AnimatorEventRegistry.js
 * @description
 * The Awtsmoos gathers observable change contracts into one detached registry before any listener chooses what to hear;
 * Awtsmoos.com keeps event discovery immutable and queryable so UI, agents, tests, and future transports share the same ear.
 */

import { HOD_ANIMATOR_EVENTS } from './AnimatorEventDefinitions.js';

/** Immutable registry for stable Animator browser event contracts. */
export class HodAnimatorEventRegistry {
	/** @returns {object[]} Detached event descriptors. */
	static all() {
		return HOD_ANIMATOR_EVENTS.map((keliEvent) => structuredClone(keliEvent));
	}

	/** @param {string} shemEvent Event name. @returns {object|null} Detached descriptor. */
	static get(shemEvent) {
		const keliEvent = HOD_ANIMATOR_EVENTS.find((candidate) => candidate.name === shemEvent);
		return keliEvent ? structuredClone(keliEvent) : null;
	}

	/** @param {string} shemEvent Event name. @returns {boolean} Whether event is registered. */
	static supports(shemEvent) {
		return HOD_ANIMATOR_EVENTS.some((candidate) => candidate.name === shemEvent);
	}
}
