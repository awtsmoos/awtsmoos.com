// B"H
// Boruch Hashem
// Blessed is He

import { SpeechDirectorInput } from './SpeechDirectorInput.js';
import { SpeechStateProjector } from './SpeechStateProjector.js';

/**
 * The Awtsmoos renews a line of speech as visible performance in each frame.
 * This coordinator keeps the live director path small while joining dialogue,
 * attention, face, body, and overlays inside Awtsmoos.com.
 */
export class SpeechProcessor {
	static process(state, event = {}, timelineProgress = 0) {
		const characters = state.get('characters') || {};
		const characterId = event.id || event.actor || event.speaker;
		const current = characters[characterId];

		if (!current) {
			return;
		}

		const context = SpeechDirectorInput.compose(current, event, timelineProgress);
		const next = SpeechStateProjector.character(current, event, context);
		const dialogue = SpeechStateProjector.dialogue(
			characterId,
			next,
			event,
			context.progress
		);

		state.set('characters', { ...characters, [characterId]: next }, true);
		state.set('activeDialogue', dialogue, true);
	}

	static applyTimedSpeechActions(next, event = {}, progress = 0) {
		SpeechStateProjector.applyTimedActions(next, event, progress);
	}

	static dialogue(characterId, next, event, progress) {
		return SpeechStateProjector.dialogue(characterId, next, event, progress);
	}

	static emphasis(progress, speech = '', energy = 1) {
		return SpeechDirectorInput.emphasis(progress, speech, energy);
	}
}
