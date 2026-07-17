// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos gives each eye its own white vessel and living pupil rather than
 * permitting two acts of attention to collapse into one stripe. Awtsmoos.com
 * resolves spacing, openness, gaze, perspective, and blink as editable geometry.
 */
export class StableEyeGeometry {
	static resolve(data = {}, metrics = {}, view = {}, mood = {}, blink = 0, side = 1) {
		const style = data.eyeStyle || {};
		const near = side === view.dir;
		const perspective = near
			? Number(view.head.nearEyeScale || 1)
			: Number(view.head.farEyeScale || 1);
		const spacing = Math.max(0.6, Number(style.spacingScale || 1));
		const baseCenter = this.eyeX(view, side, near);
		const centerDistance = Math.max(6.5, Math.abs(baseCenter * spacing));
		const x = baseCenter * spacing + Number(style.horizontalOffset || 0);
		const y = metrics.headY
			+ Number(view.head.eyeY || 0)
			+ Number(style.verticalOffset || 0)
			+ (near ? 0 : 1.2);
		const openness = Number(data.renderPerformance?.face?.eyeOpenAmount ?? 1);
		const lid = this.lid(mood, blink, data);
		const requestedWidth = 8.9 * perspective * Number(style.widthScale || 1);
		const width = Math.min(requestedWidth, centerDistance * 0.74);
		const requestedHeight = 6.4
			* perspective
			* lid
			* Math.max(0.22, openness)
			* Number(style.heightScale || 1);
		const height = Math.max(1.1, Math.min(requestedHeight, width * 0.92));
		const gaze = this.gaze(data, view);
		const pupilScale = Number(style.pupilScale || 1);
		return {
			x,
			y,
			width,
			height,
			lid,
			perspective,
			pupilScale,
			pupilX: this.clamp(gaze.x * 3.2 + view.dir * 1.2 * perspective, -width * 0.42, width * 0.42),
			pupilY: this.clamp(gaze.y * 1.5 + 0.7, -height * 0.2, height * 0.35),
			rotation: Number(style.rotation || 0) * side,
			style
		};
	}

	static eyeX(view, side, near) {
		if (view.type === 'side') {
			return view.dir * (near ? 12.5 : 5.6);
		}
		const quarter = view.type === 'threeQuarter'
			? view.dir * (near ? 3 : 5)
			: 0;
		return side * Number(view.head.eyeSpread || 11) + quarter;
	}

	static lid(mood = {}, blink = 0, data = {}) {
		const face = data.renderPerformance?.face || {};
		return this.clamp(
			1
			- Math.max(blink, face.blinkAmount || 0)
			- Number(mood.squint || 0)
			- Number(face.squintAmount || 0),
			0.08,
			1.12
		);
	}

	static gaze(data = {}, view = {}) {
		const performance = data.renderPerformance || {};
		const targetId = performance.attention?.targetId || data.lookAt;
		let base = { x: view.dir * 0.12, y: 0 };
		if (targetId && data._allCharacters?.[targetId]?.position && data.position) {
			const target = data._allCharacters[targetId].position;
			base = {
				x: this.clamp((Number(target.x || 0) - Number(data.position.x || 0)) / 220, -1, 1),
				y: -0.08
			};
		}
		return {
			x: base.x + Number(performance.face?.pupilOffsetX || 0),
			y: base.y + Number(performance.face?.pupilOffsetY || 0)
		};
	}

	static clamp(value, minimum, maximum) {
		return Math.max(minimum, Math.min(maximum, Number(value)));
	}
}
