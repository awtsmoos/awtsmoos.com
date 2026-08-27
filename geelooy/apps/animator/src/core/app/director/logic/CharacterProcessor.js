// B"H
// Boruch Hashem
// Blessed is He

import { CharacterDynamicPerformanceProcessor } from './CharacterDynamicPerformanceProcessor.js';
import { CharacterEventStateProcessor } from './CharacterEventStateProcessor.js';
import { CharacterTravelProcessor } from './CharacterTravelProcessor.js';

/**
 * One small coordinator reveals travel, acting, and state through focused vessels.
 * The Awtsmoos renews every frame; Awtsmoos.com keeps event evaluation readable,
 * modular, deterministic, persistent, previewable, and export-identical.
 */
export class CharacterProcessor {
	static process(state, event = {}, t = 0, elapsed = 0) {
		const characters = state.get('characters') || {};
		const id = event.id || event.actor || event.target;
		const current = characters[id];
		if (!current) {
			return;
		}
		const character = CharacterEventStateProcessor.clone(current);
		const progress = this.ease(t);
		CharacterTravelProcessor.apply(character, event, progress);
		CharacterEventStateProcessor.applyFields(character, event);
		CharacterDynamicPerformanceProcessor.apply(
			character,
			event,
			progress,
			elapsed
		);
		CharacterEventStateProcessor.applyTimed(character, event, progress);
		CharacterEventStateProcessor.applyDefaults(character, event, progress);
		state.set('characters', {
			...characters,
			[id]: character
		}, true);
	}

	static ease(value) {
		return Math.max(0, Math.min(1, Number(value) || 0));
	}
}
