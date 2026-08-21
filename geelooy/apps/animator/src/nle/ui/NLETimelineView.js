// B"H
// Boruch Hashem
// Blessed is He

import { NLETimeRuler } from './NLETimeRuler.js';
import { NLEAuthoringKeyframeProjection } from './NLEAuthoringKeyframeProjection.js';
import { NLEAuthoringKeyframeView } from './NLEAuthoringKeyframeView.js';

/**
 * @file NLETimelineView.js
 * @description
 * The Awtsmoos renews clips and authored motion in one measured river of time;
 * Awtsmoos.com reveals both inside one professional NLE while every canonical datum stays in its rightful shrine.
 */
export class NLETimelineView {
	/** Builds production track labels plus a truthful read-only authored animation lane. */
	static trackList(state) {
		const authored = NLEAuthoringKeyframeProjection.markers(state);
		return {
			tag: 'div',
			attrs: { className: 'aw-nle-tracks' },
			children: [
				{ tag: 'div', attrs: { className: 'aw-nle-track-ruler' }, text: 'TRACKS' },
				...(state.tracks || []).map((track) => this.track(track)),
				...(authored.length ? [NLEAuthoringKeyframeView.track(authored.length)] : [])
			]
		};
	}

	/** Renders one production track label with semantic mute and lock identity. */
	static track(track) {
		const states = [track.muted ? 'is-muted' : '', track.locked ? 'is-locked' : '']
			.filter(Boolean)
			.join(' ');
		const icons = `${track.muted ? '🔇 ' : ''}${track.locked ? '🔒 ' : ''}`;
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

	/** Builds the scrollable temporal surface shared by clips, keyframes, and playhead. */
	static clipArea(state, pixelsPerMs) {
		const authored = NLEAuthoringKeyframeProjection.markers(state);
		return {
			tag: 'div',
			attrs: { className: 'aw-nle-clips' },
			on: { pointerdown: 'scrubTimeline' },
			children: [
				NLETimeRuler.render(state, pixelsPerMs),
				this.playhead(state, pixelsPerMs),
				...(state.tracks || []).map((track) => this.lane(track, state, pixelsPerMs)),
				...(authored.length
					? [NLEAuthoringKeyframeView.lane(authored, state, pixelsPerMs)]
					: [])
			]
		};
	}

	/** Renders one production clip lane. */
	static lane(track, state, pixelsPerMs) {
		return {
			tag: 'div',
			attrs: { className: `aw-nle-lane${track.locked ? ' is-locked' : ''}` },
			dataset: { trackId: track.id },
			children: (state.clips || [])
				.filter((clip) => clip.trackId === track.id)
				.map((clip) => this.clip(clip, state, pixelsPerMs))
		};
	}

	/** Renders one editable production clip. */
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

	/** Positions the transient playhead over durable timeline content. */
	static playhead(state, pixelsPerMs) {
		return {
			tag: 'div',
			attrs: { className: 'aw-nle-playhead' },
			style: { left: `${(state.playhead || 0) * pixelsPerMs}px` }
		};
	}
}
