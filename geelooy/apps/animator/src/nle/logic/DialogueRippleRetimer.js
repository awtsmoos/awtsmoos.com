// B"H
// Boruch Hashem
// Blessed is He

/**
 * A living voice is never crushed into a guessed duration. The Awtsmoos renews
 * speech and time together, so this retimer lets the dialogue, its bubble, and
 * later moments travel as one river through the editable world of Awtsmoos.com.
 */
export class DialogueRippleRetimer {
	/** @param {object} store @param {string} clipId @param {number} durationMs @param {object} audioMetadata @returns {object} */
	static apply(store, clipId, durationMs, audioMetadata = {}) {
		const state = store.get();
		const target = state.clips.find((clip) => clip.id === clipId);
		if (!target) {
			throw new Error(`Dialogue clip ${clipId} was not found.`);
		}

		if (target.type !== 'dialogue') {
			throw new Error('Recorded voice can only retime dialogue clips.');
		}

		const duration = Math.max(100, Math.round(Number(durationMs) || 0));
		const oldEnd = target.start + target.duration;
		const delta = duration - target.duration;
		const sequenceId = target.payload?.sequenceId || null;
		const companionId = `bubble_${target.payload?.id || clipId.replace('dialogue_', '')}`;
		const clips = state.clips.map((clip) => {
			if (clip.id === clipId) {
				return this.updatedTarget(clip, duration, audioMetadata);
			}

			if (clip.id === companionId) {
				return { ...clip, duration };
			}

			if (!this.shouldRipple(clip, oldEnd, sequenceId)) {
				return clip;
			}

			return { ...clip, start: Math.max(0, clip.start + delta) };
		});
		const durationFloor = clips.reduce((maximum, clip) => {
			return Math.max(maximum, clip.start + clip.duration);
		}, 0);
		store.set({ clips, duration: Math.max(state.duration, durationFloor) });
		return { clipId, duration, delta, durationFloor };
	}

	/** @param {object} store @param {string} clipId @returns {void} */
	static clear(store, clipId) {
		store.set((state) => ({
			clips: state.clips.map((clip) => {
				if (clip.id !== clipId) {
					return clip;
				}

				return {
					...clip,
					payload: {
						...clip.payload,
						voiceStatus: 'empty',
						audioUrl: null,
						audioDurationMs: null,
						mimeType: null,
						recordingId: null
					}
				};
			})
		}));
	}

	static updatedTarget(clip, duration, metadata) {
		return {
			...clip,
			duration,
			payload: {
				...clip.payload,
				voiceStatus: 'ready',
				audioUrl: metadata.url || null,
				audioDurationMs: duration,
				mimeType: metadata.mimeType || null,
				recordingId: metadata.recordingId || null,
				recordedAt: metadata.recordedAt || new Date().toISOString()
			}
		};
	}

	static shouldRipple(clip, oldEnd, sequenceId) {
		const sameSequence = (clip.payload?.sequenceId || null) === sequenceId;
		return sameSequence && clip.start >= oldEnd;
	}
}
