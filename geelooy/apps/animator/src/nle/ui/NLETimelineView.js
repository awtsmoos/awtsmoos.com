// B"H
// Boruch Hashem
// Blessed is He

/**
 * The lanes reveal how created moments coexist. The Awtsmoos renews every clip
 * while this focused view keeps track labels, clip geometry, and playhead pure.
 */
export class NLETimelineView {
	static trackList(state) {
		return {
			tag: 'div',
			attrs: { className: 'aw-nle-tracks' },
			children: (state.tracks || []).map(track => ({
				tag: 'div',
				attrs: { className: 'aw-nle-track-name' },
				dataset: { trackId: track.id },
				text: track.name
			}))
		};
	}

	static clipArea(state, pixelsPerMs) {
		return {
			tag: 'div',
			attrs: { className: 'aw-nle-clips' },
			on: { pointerdown: 'scrubTimeline' },
			children: [
				this.playhead(state, pixelsPerMs),
				...(state.tracks || []).map(track => this.lane(track, state, pixelsPerMs))
			]
		};
	}

	static lane(track, state, pixelsPerMs) {
		return {
			tag: 'div',
			attrs: { className: 'aw-nle-lane' },
			dataset: { trackId: track.id },
			children: (state.clips || [])
				.filter(clip => clip.trackId === track.id)
				.map(clip => this.clip(clip, state, pixelsPerMs))
		};
	}

	static clip(clip, state, pixelsPerMs) {
		return {
			tag: 'button',
			attrs: {
				className: `aw-nle-clip${state.selectedClipId === clip.id ? ' selected' : ''}`
			},
			dataset: { clipId: clip.id },
			style: {
				left: `${clip.start * pixelsPerMs}px`,
				width: `${Math.max(48, clip.duration * pixelsPerMs)}px`
			},
			on: { click: 'selectClip' },
			text: clip.name || 'Clip'
		};
	}

	static playhead(state, pixelsPerMs) {
		return {
			tag: 'div',
			attrs: { className: 'aw-nle-playhead' },
			style: { left: `${(state.playhead || 0) * pixelsPerMs}px` }
		};
	}
}
