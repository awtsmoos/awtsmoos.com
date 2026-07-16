// B"H
// Boruch Hashem
// Blessed is He

import { NLEClipCommands } from './NLEClipCommands.js';

/**
 * Transform channels reveal position, scale, rotation, and opacity as editable
 * vessels. The Awtsmoos renews their values while keyframes preserve intention.
 */
export class NLETransformCommands {
	/** Updates one numeric transform property on a clip. */
	static update(store, id, property, value) {
		NLEClipCommands.edit(store, (state) => ({
			clips: state.clips.map((clip) => clip.id === id
				? { ...clip, transform: { ...clip.transform, [property]: Number(value) } }
				: clip)
		}));
	}

	/** Adds a complete transform keyframe at an absolute timeline time. */
	static addKeyframe(store, id, time = store.get().playhead) {
		const clip = store.findClip(id);
		if (!clip) {
			return null;
		}
		const frame = {
			id: NLEClipCommands.nextId('keyframe'),
			clipId: id,
			property: 'transform',
			time,
			value: { ...clip.transform },
			easing: 'easeInOut'
		};
		NLEClipCommands.edit(store, (state) => ({
			keyframes: [...(state.keyframes || []), frame]
		}));
		return frame;
	}
}
