// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NLEAuthoringKeyframeView.js
 * @description
 * The Awtsmoos renews authored motion while this view gives each keyframe a visible sign;
 * Awtsmoos.com projects the canonical Studio document into the NLE without claiming a second timeline.
 */
export class NLEAuthoringKeyframeView {
	/** Names the read-only projection lane for real Studio-authored keyframes. */
	static track(count) {
		return {
			tag: 'div',
			attrs: {
				className: 'aw-nle-track-name aw-nle-authored-track',
				title: `${count} authored object keyframe${count === 1 ? '' : 's'}`
			},
			dataset: { trackId: '__studio-authored__' },
			text: `🔑 Authored (${count})`
		};
	}

	/** Renders the truthful authored-keyframe projection without implying drag support. */
	static lane(markers, state, pixelsPerMs) {
		return {
			tag: 'div',
			attrs: { className: 'aw-nle-lane aw-nle-authored-lane' },
			dataset: { trackId: '__studio-authored__' },
			children: markers.map((marker) => this.marker(marker, state, pixelsPerMs))
		};
	}

	/** Places one accessible authored keyframe at its canonical document time. */
	static marker(marker, state, pixelsPerMs) {
		const duration = Math.max(0, Number(state.duration) || marker.time);
		const time = Math.min(Math.max(0, marker.time), duration);
		return {
			tag: 'span',
			attrs: {
				className: 'aw-nle-authored-keyframe',
				title: marker.label,
				role: 'img',
				'aria-label': marker.label
			},
			dataset: { keyframeId: marker.id, entityId: marker.entityId },
			style: {
				left: `${time * pixelsPerMs}px`,
				position: 'absolute',
				top: '50%',
				transform: 'translate(-50%, -50%)',
				pointerEvents: 'none'
			},
			text: '🔑'
		};
	}
}
