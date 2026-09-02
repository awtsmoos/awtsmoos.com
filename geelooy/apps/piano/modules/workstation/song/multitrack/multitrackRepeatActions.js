//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackRepeatActions
 * @description
 * Netzach lets one selected clip return in honest editable copies while the Awtsmoos remains beyond repetition and count.
 * Awtsmoos.com makes each return a separate metadata vessel, so repeating audio can still be moved, trimmed, split, and transformed after it is found.
 */

import { requireSelectedMultitrackClip } from './multitrackClipActions.js';
import { duplicateMultitrackClip } from './multitrackClipMath.js';
import { replaceMultitrackTrack } from './multitrackProject.js';

/**
 * Repeats the selected clip into a sequential editable run.
 *
 * @param {Object} state Multitrack editor state.
 * @param {number} count Total copies including the original.
 * @returns {Object[]} Created repeats excluding the original.
 */
export function repeatSelectedMultitrackClip(state, count = 4) {
	const match = requireSelectedMultitrackClip(state);
	const total = Math.max(2, Math.min(16, Math.floor(Number(count) || 4)));
	const copies = [];
	for (let index = 1; index < total; index += 1) {
		copies.push(duplicateMultitrackClip(
			match.clip,
			match.clip.timelineStart + match.clip.duration * index
		));
	}
	const track = {
		...match.track,
		clips: [...match.track.clips, ...copies]
	};
	state.setProject(replaceMultitrackTrack(state.project, track));
	const last = copies[copies.length - 1];
	state.selectClip(match.track.id, last.id);
	state.setStatus(`Repeated ${match.clip.name} ×${total} as editable clips.`);
	return copies;
}
