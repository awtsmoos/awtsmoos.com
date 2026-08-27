// B"H
// Boruch Hashem
// Blessed is He

import { NLETimeRuler } from './NLETimeRuler.js';

/**
 * Tracks, ruler, clips, and playhead share one measured temporal landscape. The
 * Awtsmoos renews every edit; Awtsmoos.com keeps state, selection, drag geometry,
 * zoom, snapping, and deterministic evaluation declarative and synchronized.
 */
export class NLETimelineView {
	static trackList(state) {
		return {
			tag: 'div',
			attrs: { className: 'aw-nle-tracks' },
			children: [
				{
					tag: 'div',
					attrs: { className: 'aw-nle-track-ruler' },
					text: 'TRACKS'
				},
				...(state.tracks || []).map((track) => this.track(track))
			]
		};
	}

	static track(track) {
		const states = [
			track.muted ? 'is-muted' : '',
			track.locked ? 'is-locked' : ''
		].filter(Boolean).join(' ');
		const icons = `${track.muted ? 'M ' : ''}${track.locked ? 'L ' : ''}`;
		return {
			tag: 'div',
			attrs: {
				className: `aw-nle-track-name ${states}`.trim(),
				title: `${track.name}${track.muted ? ' • muted' : ''}${track.locked ? ' • locked' : ''}`
			},
			dataset: { trackId: track.id },
			text: `${icons}${track.name}`
		};
	}

	static clipArea(state, pixelsPerMs) {
		return {
			tag: 'div',
			attrs: { className: 'aw-nle-clips' },
			on: { pointerdown: 'scrubTimeline' },
			children: [
				NLETimeRuler.render(state, pixelsPerMs),
				this.playhead(state, pixelsPerMs),
				...(state.tracks || []).map((track) => {
					return this.lane(track, state, pixelsPerMs);
				})
			]
		};
	}

	static lane(track, state, pixelsPerMs) {
		return {
			tag: 'div',
			attrs: {
				className: `aw-nle-lane${track.locked ? ' is-locked' : ''}`
			},
			dataset: { trackId: track.id },
			children: (state.clips || [])
				.filter((clip) => clip.trackId === track.id)
				.map((clip) => this.clip(clip, state, pixelsPerMs))
		};
	}

	static clip(clip, state, pixelsPerMs) {
		const selected = state.selectedClipId === clip.id ? ' selected' : '';
		const type = String(clip.type || 'clip').replace(/[^a-z0-9_-]/giu, '');
		return {
			tag: 'button',
			attrs: {
				className: `aw-nle-clip is-${type}${selected}`,
				title: `${clip.name} • drag to move • ${clip.duration} ms`
			},
			dataset: { clipId: clip.id },
			style: {
				left: `${clip.start * pixelsPerMs}px`,
				width: `${Math.max(48, clip.duration * pixelsPerMs)}px`
			},
			on: { click: 'selectClip', pointerdown: 'beginClipDrag' },
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
