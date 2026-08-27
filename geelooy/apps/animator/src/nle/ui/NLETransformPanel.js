// B"H
// Boruch Hashem
// Blessed is He

/**
 * The inspector reveals transform channels as editable vessels rather than raw
 * JSON. The Awtsmoos renews position and form; keyframes preserve their journey.
 */
export class NLETransformPanel {
	/** Renders transform fields and their current keyframe count. */
	static render(clip, state) {
		if (!clip) {
			return this.empty();
		}
		const transform = {
			x: 0,
			y: 0,
			scaleX: 1,
			scaleY: 1,
			rotation: 0,
			opacity: 1,
			...(clip.transform || {})
		};
		const keyframeCount = (state.keyframes || []).filter((frame) => {
			return frame.clipId === clip.id && frame.property === 'transform';
		}).length;
		return {
			tag: 'section',
			attrs: { className: 'aw-nle-transform-panel' },
			children: [
				{ tag: 'h4', text: 'Transform' },
				...this.fields(clip.id, transform),
				{
					tag: 'button',
					attrs: { className: 'aw-nle-btn' },
					on: { click: 'addTransformKeyframe' },
					text: `◆ Keyframe at playhead (${keyframeCount})`
				}
			]
		};
	}

	/** Builds all supported arbitrary property fields. */
	static fields(clipId, transform) {
		return [
			['X', 'x', transform.x, '1'],
			['Y', 'y', transform.y, '1'],
			['Scale X', 'scaleX', transform.scaleX, '0.01'],
			['Scale Y', 'scaleY', transform.scaleY, '0.01'],
			['Rotation', 'rotation', transform.rotation, '0.1'],
			['Opacity', 'opacity', transform.opacity, '0.01']
		].map(([label, property, value, step]) => ({
			tag: 'label',
			attrs: { className: 'aw-nle-field' },
			children: [
				{ tag: 'span', text: label },
				{
					tag: 'input',
					attrs: { type: 'number', value, step },
					dataset: { clipId, property },
					on: { change: 'updateTransformField' }
				}
			]
		}));
	}

	static empty() {
		return {
			tag: 'div',
			attrs: { className: 'aw-nle-field' },
			text: 'Select a clip to edit transforms.'
		};
	}
}
