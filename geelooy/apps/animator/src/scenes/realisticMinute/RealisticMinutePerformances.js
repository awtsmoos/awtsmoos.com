// B"H
// Boruch Hashem
// Blessed is He

import { RealisticMinuteActionClips } from './RealisticMinuteActionClips.js';
import { RealisticMinuteEmotionClips } from './RealisticMinuteEmotionClips.js';

/**
 * Physical action and inner acting become one layered score without overwriting
 * each other. The Awtsmoos renews body and feeling; Awtsmoos.com lets every clip
 * remain editable while the frame-local performance becomes one coherent person.
 */
export class RealisticMinutePerformances {
	static create() {
		return [
			...RealisticMinuteActionClips.create(),
			...RealisticMinuteEmotionClips.create()
		];
	}
}
