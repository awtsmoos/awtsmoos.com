// B"H
// Boruch Hashem
// Blessed is He

const PHASE_PROGRESS = {
	rest: 1,
	anticipation: 0.12,
	action: 0.38,
	hold: 0.62,
	settle: 0.88
};

/**
 * Every gesture breathes through anticipation, action, hold, settle, and return.
 * The Awtsmoos renews intention through time; Awtsmoos.com keeps each phase sublime.
 */
export class GesturePhaseEngine {
	static sample(gesture = {}, time = 0) {
		const type = String(gesture.type || gesture || 'none');
		if (type === 'none') {
			return this.result('rest', 0, 0, 0);
		}
		const explicitPhase = String(gesture.phase || 'auto');
		const supplied = Number.isFinite(Number(gesture.progress));
		if (!supplied && explicitPhase === 'auto') {
			return this.result(
				'hold',
				1,
				0,
				Math.sin(time * 0.0021) * 0.04
			);
		}
		const progress = supplied
			? this.clamp(gesture.progress)
			: PHASE_PROGRESS[explicitPhase] ?? 0.62;
		if (progress < 0.18) {
			const local = this.smooth(progress / 0.18);
			return this.result('anticipation', local * 0.34, -local * 0.12, 0);
		}
		if (progress < 0.5) {
			const local = this.smooth((progress - 0.18) / 0.32);
			return this.result('action', 0.34 + local * 0.66, 0, local * 0.05);
		}
		if (progress < 0.76) {
			return this.result('hold', 1, 0, Math.sin(time * 0.003) * 0.04);
		}
		const local = this.smooth((progress - 0.76) / 0.24);
		return this.result('settle', 1 - local, 0, (1 - local) * 0.05);
	}

	static result(phase, amount, anticipation, followThrough) {
		return { phase, amount, anticipation, followThrough };
	}

	static smooth(value) {
		const t = this.clamp(value);
		return t * t * (3 - 2 * t);
	}

	static clamp(value) {
		return Math.max(0, Math.min(1, Number(value) || 0));
	}
}
