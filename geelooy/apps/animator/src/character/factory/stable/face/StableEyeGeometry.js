// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos gives each eye its own white vessel, living pupil, and expressive
 * lid. Awtsmoos.com resolves explicit reference radii while guaranteeing a bridge
 * of skin between both eyes through every blink, gaze, save, reload, and export.
 */
export class StableEyeGeometry {
	static resolve(data = {}, metrics = {}, view = {}, mood = {}, blink = 0, side = 1) {
		const style = data.eyeStyle || {};
		const near = side === view.dir;
		const perspective = near
			? Number(view.head.nearEyeScale || 1)
			: Number(view.head.farEyeScale || 1);
		const spacing = Math.max(0.7, Number(style.spacingScale || 1));
		const baseCenter = this.eyeX(view, side, near);
		const centerDistance = Math.max(7, Math.abs(baseCenter * spacing));
		const x = baseCenter * spacing + Number(style.horizontalOffset || 0);
		const y = metrics.headY
			+ Number(view.head.eyeY || 0)
			+ Number(style.verticalOffset || 0)
			+ (near ? 0 : 0.8);
		const openness = Number(data.renderPerformance?.face?.eyeOpenAmount ?? 1);
		const lid = this.lid(mood, blink, data);
		const requestedWidth = Number(style.radiusX || 9.4)
			* perspective
			* Number(style.widthScale || 1);
		const width = Math.min(
			requestedWidth,
			centerDistance * Number(style.separationRatio || 0.74)
		);
		const requestedHeight = Number(style.radiusY || 8.2)
			* perspective
			* Number(style.heightScale || 1)
			* Math.max(0.15, openness)
			* lid;
		const height = Math.max(
			1.1,
			Math.min(requestedHeight, width * Number(style.maxAspect || 1.08))
		);
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
			pupilX: this.clamp(
				gaze.x * 3.4 + view.dir * 0.7 * perspective,
				-width * 0.43,
				width * 0.43
			),
			pupilY: this.clamp(
				gaze.y * 1.7 + Number(style.pupilVertical || 0.5),
				-height * 0.24,
				height * 0.36
			),
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
		let base = { x: view.dir * 0.08, y: 0 };
		if (targetId && data._allCharacters?.[targetId]?.position && data.position) {
			const target = data._allCharacters[targetId].position;
			base = {
				x: this.clamp(
					(Number(target.x || 0) - Number(data.position.x || 0)) / 220,
					-1,
					1
				),
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
