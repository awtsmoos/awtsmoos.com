// B"H
// Boruch Hashem
// Blessed is He
import { handleSoundEvent } from './sound/cues.js';
import {
	createAudioState,
	unlockAudio
} from './sound/voice.js';

/**
 * Sound remains one public game service while voice allocation and event cues live
 * in focused bounded modules beneath it.
 */
export function createSound(world) {
	const audio = createAudioState();
	const unlock = () => unlockAudio(audio);
	window.addEventListener('pointerdown', unlock, { capture: true, passive: true });
	window.addEventListener('keydown', unlock, { capture: true });
	return {
		unlock,
		event(event) {
			if (!audio.ready || audio.context?.state !== 'running') return;
			handleSoundEvent(event, world, audio);
		}
	};
}
