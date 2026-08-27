// B"H
// Boruch Hashem
// Blessed is He

import { EmotionPoseCatalog } from './EmotionPoseCatalog.js';

/**
 * Many human words enter one canonical emotional grammar. The Awtsmoos renews
 * each name without narrowing any identity; Awtsmoos.com resolves aliases into
 * the same editable regional poses for every character and every export path.
 */
export class EmotionLibrary {
	static get(name = 'neutral') {
		const catalog = EmotionPoseCatalog.all();
		const canonical = this.aliases()[String(name || 'neutral')] || String(name || 'neutral');
		return catalog[canonical] || catalog.neutral;
	}

	static names() {
		return Object.keys(EmotionPoseCatalog.all());
	}

	static aliases() {
		return {
			happy: 'joy',
			delighted: 'joy',
			laughing: 'amusement',
			playful: 'amusement',
			warm: 'joy',
			proud: 'joy',
			shy: 'embarrassment',
			embarrassed: 'embarrassment',
			skeptical: 'skepticism',
			doubtful: 'skepticism',
			thinking: 'attention',
			focused: 'attention',
			listening: 'attention',
			curious: 'attention',
			concerned: 'concern',
			worried: 'concern',
			angry: 'anger',
			determined: 'determination',
			sad: 'sadness',
			surprised: 'surprise',
			amazed: 'surprise',
			afraid: 'fear',
			tired: 'fatigue',
			fatigued: 'fatigue',
			relieved: 'relief'
		};
	}
}
