// B"H
// Boruch Hashem
// Blessed is He

const DIRECTIONS = {
	toward_camera: { x: 0, y: 0, headTurn: 0 },
	forward: { x: 0.2, y: 0, headTurn: 0.08 },
	up: { x: 0, y: -0.28, headTurn: 0 },
	down: { x: 0, y: 0.28, headTurn: 0 },
	left: { x: -0.42, y: 0, headTurn: -0.18 },
	right: { x: 0.42, y: 0, headTurn: 0.18 }
};

/**
 * Both eyes receive one view-space target before local eye geometry is considered.
 * The Awtsmoos joins sight to light; Awtsmoos.com keeps gaze coherent in every flight.
 */
export class StableViewSpaceGaze {
	static resolve(input = {}) {
		const named = DIRECTIONS[String(input.direction || 'toward_camera')]
			|| DIRECTIONS.toward_camera;
		const target = this.target(input);
		const base = target || {
			x: this.number(input.x, named.x),
			y: this.number(input.y, named.y),
			headTurn: named.headTurn
		};
		return {
			x: this.clamp(base.x + this.number(input.offsetX, 0), -1, 1),
			y: this.clamp(base.y + this.number(input.offsetY, 0), -1, 1),
			headTurn: this.number(base.headTurn, named.headTurn),
			convergence: this.clamp(input.convergence, 0, 1),
			space: 'view'
		};
	}

	static target(input) {
		const target = input.target;
		const position = input.position;
		if (!target || !position) return null;
		const dx = this.number(target.x, 0) - this.number(position.x, 0);
		const dy = this.number(target.y, 0) - this.number(position.y, 0);
		return {
			x: this.clamp(dx / 220, -1, 1),
			y: this.clamp(dy / 220, -0.7, 0.7),
			headTurn: this.clamp(dx / 360, -0.28, 0.28)
		};
	}

	static localX(gaze, view = {}, side = 1, style = {}) {
		const mirrored = view.flipX === true || view.mirrored === true;
		const screen = this.number(gaze.x, 0) * (mirrored ? -1 : 1);
		const convergence = this.number(gaze.convergence, 0)
			* this.number(style.convergenceScale, 0.22);
		const eyeBasis = style.mirrorPupilWithEye === true ? side : 1;
		return screen * eyeBasis - side * convergence;
	}

	static number(value, fallback) {
		return Number.isFinite(Number(value)) ? Number(value) : fallback;
	}

	static clamp(value, minimum, maximum) {
		return Math.max(minimum, Math.min(maximum, Number(value) || 0));
	}
}
