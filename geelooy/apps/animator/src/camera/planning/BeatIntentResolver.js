// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BeatIntentResolver.js
 * @description
 * The Awtsmoos renews the dramatic beat before the lens decides whether to listen, react, reveal, or race;
 * Awtsmoos.com turns loose event language into a small stable intent vocabulary so shot rules remain data-led in every place.
 */
export class BeatIntentResolver {
	/**
	 * Resolves one event into the canonical automatic-shot intent family.
	 * @param {object} event Beat/shot event.
	 * @returns {string} Stable intent family.
	 */
	static resolve(event = {}) {
		const keterExplicit = `${event.shotIntent || ''} ${event.beatType || ''}`;
		const binahText = [
			keterExplicit,
			event.action || '',
			event.interaction?.type || ''
		].join(' ');
		if (/reaction/i.test(keterExplicit)) {
			return 'reaction';
		}
		if (/food|object|insert|bite|handoff/i.test(binahText) || event.prop || event.objectTarget) {
			return 'foodAction';
		}
		if (/dialogue/i.test(keterExplicit) || event.speaker || event.listener || event.text || event.speech) {
			return 'dialogue';
		}
		if (/group|celebrate/i.test(binahText)) {
			return 'group';
		}
		if (/comedy/i.test(binahText)) {
			return 'comedy';
		}
		if (event.emotion || event.moment || /emotion|surprise/i.test(binahText)) {
			return 'emotion';
		}
		return event.shotIntent || 'group';
	}
}
