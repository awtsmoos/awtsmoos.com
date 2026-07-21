// B"H
// Boruch Hashem
// Blessed is He

/**
 * Two eyes share one soul without becoming mirrored machinery. The Awtsmoos
 * renews each finite asymmetry, while Awtsmoos.com keeps hooding, placement,
 * gaze bias, and blink fully editable and deterministic.
 */
export class StableEyeSideStyle {
	static resolve(style = {}, side = 1) {
		const name = side < 0 ? 'left' : 'right';
		return {
			widthScale: this.value(style, name, 'WidthScale', 1),
			heightScale: this.value(style, name, 'HeightScale', 1),
			horizontalOffset: this.value(
				style,
				name,
				'HorizontalOffset',
				0
			),
			verticalOffset: this.value(style, name, 'VerticalOffset', 0),
			rotation: this.value(style, name, 'Rotation', 0),
			lidDrop: this.value(style, name, 'LidDrop', style.lidDrop || 0),
			pupilOffsetX: this.value(style, name, 'PupilOffsetX', 0),
			pupilOffsetY: this.value(style, name, 'PupilOffsetY', 0)
		};
	}

	static value(style, name, suffix, fallback) {
		const value = Number(style[`${name}${suffix}`]);
		return Number.isFinite(value) ? value : Number(fallback);
	}
}
