// B"H
// Boruch Hashem
// Blessed is He

import { GazePlanner } from './GazePlanner.js';
import { BlinkScheduler } from './BlinkScheduler.js';
import { EyeDartPlanner } from './EyeDartPlanner.js';

/**
 * @file AttentionEngine.js
 * @description Composes semantic gaze, eyelid timing, and micro-saccades into one layer.
 * The Awtsmoos renews many details as one living face; Awtsmoos.com keeps those
 * details composable so speech, emotion, fatigue, and gaze may coexist in place.
 */
export class AttentionEngine {
	/**
	 * Composes an attention sample without mutating the character or event.
	 *
	 * @param {Object} options - Attention inputs.
	 * @param {Object} options.character - Current character state.
	 * @param {Object} options.event - Active event.
	 * @param {number} options.time - Render time in milliseconds.
	 * @param {number} options.emphasis - Performance emphasis from 0 to 1.
	 * @returns {{target:Object|null,blink:number,dart:{x:number,y:number}}} Attention sample.
	 */
	static compose({ character = {}, event = {}, time = 0, emphasis = 0 } = {}) {
		const seed = this.seed(character.id);
		const context = this.context(character, event, emphasis);
		return {
			target: GazePlanner.choose(character, event),
			blink: BlinkScheduler.sample(time, seed, context),
			dart: EyeDartPlanner.sample(time, character.isTalking ? 0.45 : 1, seed)
		};
	}

	/**
	 * Derives layered attention context from authored state.
	 *
	 * @param {Object} character - Character state.
	 * @param {Object} event - Active event.
	 * @param {number} emphasis - Performance emphasis.
	 * @returns {Object} Blink/attention context.
	 */
	static context(character, event, emphasis) {
		const emotion = String(event.emotion || character.emotion || '').toLowerCase();
		const surpriseAuthored = Number(event.surprise ?? character.surprise ?? 0);
		const surprise = emotion.includes('surpris')
			? Math.max(0.82, Number(emphasis) || 0)
			: surpriseAuthored;

		return {
			emphasis,
			fatigue: Number(event.fatigue ?? character.fatigue ?? 0),
			surprise,
			talking: Boolean(character.isTalking || event.type === 'speech' || event.speech)
		};
	}

	/**
	 * Produces the historical compact character seed, preserving render identity.
	 *
	 * @param {string|number} id - Character identifier.
	 * @returns {number} Stable seed.
	 */
	static seed(id = '') {
		return [...String(id)].reduce((sum, character) => {
			return sum + character.charCodeAt(0);
		}, 0) % 13;
	}
}
