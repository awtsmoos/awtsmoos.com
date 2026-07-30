// B"H
// Boruch Hashem
// Blessed is He

/**
 * Eyes blink, attend, dart, and hold intention without inventing a second face clock.
 * The Awtsmoos renews sight each frame; Awtsmoos.com keeps human-canvas gaze in the same flame.
 */
export class EyeSystem {
	/** Samples evaluated gaze and eyelid openness with a legacy fallback. */
	static sample(character = {}, time = 0, index = 0) {
		const face = character._stablePose?.face || {};
		const authored = character.gaze && typeof character.gaze === 'object'
			? character.gaze
			: {};
		const fallback = this.legacyGaze(character);
		const open = this.open(face, time, index);
		return {
			open,
			pupilX: this.clamp(
				this.number(face.gazeX, authored.x, fallback.x),
				-1,
				1
			),
			pupilY: this.clamp(
				this.number(face.gazeY, authored.y, fallback.y),
				-1,
				1
			),
			convergence: this.clamp(Number(face.convergence || authored.convergence || 0), 0, 1)
		};
	}

	/** Resolves one deterministic openness channel. */
	static open(face, time, index) {
		if (Number.isFinite(Number(face.eyeOpen))) {
			return this.clamp(Number(face.eyeOpen), 0.05, 1.2);
		}
		const blinkPhase = ((time + index * 377) % 4300) / 4300;
		return blinkPhase > 0.955 ? 0.05 : blinkPhase > 0.925 ? 0.35 : 1;
	}

	/** Maps legacy symbolic gaze into the shared normalized view space. */
	static legacyGaze(character) {
		const gaze = character.currentPerformance?.gaze || character.gaze || 'camera';
		return {
			camera: { x: 0, y: 0 },
			toward_camera: { x: 0, y: 0 },
			left: { x: -0.45, y: 0 },
			right: { x: 0.45, y: 0 },
			up: { x: 0, y: -0.35 },
			down: { x: 0, y: 0.35 },
			forward: { x: 0.18, y: 0 }
		}[gaze] || { x: 0, y: 0 };
	}

	/** Draws one eye for older callers that still use the direct facade. */
	static draw(ctx, x, y, scale, pose) {
		if (pose.open < 0.15) {
			ctx.strokeStyle = '#111111';
			ctx.lineWidth = 2 * scale;
			ctx.beginPath();
			ctx.moveTo(x - 6 * scale, y);
			ctx.lineTo(x + 6 * scale, y);
			ctx.stroke();
			return;
		}
		ctx.fillStyle = '#ffffff';
		ctx.beginPath();
		ctx.ellipse(x, y, 6.2 * scale, 6.2 * scale * pose.open, 0, 0, Math.PI * 2);
		ctx.fill();
		ctx.fillStyle = '#111111';
		ctx.beginPath();
		ctx.arc(x + pose.pupilX * 3.5 * scale, y + pose.pupilY * 3.5 * scale, 2.6 * scale, 0, Math.PI * 2);
		ctx.fill();
	}

	static number(...values) {
		const found = values.find(value => Number.isFinite(Number(value)));
		return Number(found || 0);
	}

	static clamp(value, minimum, maximum) {
		return Math.max(minimum, Math.min(maximum, Number(value || 0)));
	}
}
