// B"H
// Boruch Hashem
// Blessed is He

import { CameraEasing as Ease } from './CameraEasing.js';

/**
 * A camera move is a decision about attention, danger, intimacy, and time. The
 * Awtsmoos renews each viewpoint while Awtsmoos.com gives pursuit, orbit,
 * stillness, impact, and discovery their own readable physical grammar.
 */
export class CameraMotionLibrary {
	static resolve(name, progress, timeMs, shot = {}) {
		const method = this[name] || this.locked;
		return method.call(this, Ease.clamp(progress), timeMs, shot);
	}

	static locked(progress, timeMs) {
		return this.state(0, Ease.drift(timeMs, 1800) * 0.6, 1, 0, 0.2, 0.2);
	}

	static slowPush(progress, timeMs) {
		return this.state(0, Ease.drift(timeMs, 2200) * 0.35, 1 + Ease.smoother(progress) * 0.1, 0, 0.35, 0.3);
	}

	static dollyIn(progress) {
		return this.state(0, 0, 1 + Ease.cinematic(progress) * 0.28, 0, 0.55, 0.4);
	}

	static pullBack(progress) {
		return this.state(0, -Ease.smooth(progress) * 8, 1.2 - Ease.smoother(progress) * 0.32, 0, 0.28, 0.55);
	}

	static truckRight(progress) {
		return this.state(Ease.lerp(-105, 105, Ease.cinematic(progress)), 0, 1.02, 0, 0.4, 0.78);
	}

	static truckLeft(progress) {
		return this.state(Ease.lerp(105, -105, Ease.cinematic(progress)), 0, 1.02, 0, 0.4, 0.78);
	}

	static arcLeft(progress) {
		const angle = Ease.cinematic(progress) * Math.PI;
		return this.state(Math.cos(angle) * 54, Math.sin(angle) * -16, 1.06, -2 + progress * 4, 0.62, 0.72);
	}

	static orbitRight(progress) {
		const angle = Ease.smoother(progress) * Math.PI * 1.35;
		return this.state(Math.sin(angle) * 82, Math.cos(angle) * 18, 1.08 + Math.sin(angle) * 0.05, 3 - progress * 6, 0.7, 0.92);
	}

	static craneUp(progress) {
		return this.state(0, Ease.lerp(58, -74, Ease.cinematic(progress)), Ease.lerp(1.12, 0.88, progress), 0, 0.42, 0.65);
	}

	static craneDive(progress) {
		return this.state(Ease.lerp(-30, 26, progress), Ease.lerp(-92, 34, Ease.smoother(progress)), Ease.lerp(0.76, 1.24, progress), -4 + progress * 8, 0.64, 0.9);
	}

	static pursuit(progress, timeMs) {
		const drift = Ease.drift(timeMs, 170, 0.7);
		return this.state(Ease.lerp(-70, 74, Ease.anticipate(progress)) + drift * 5, drift * 2.8, 1.12, drift * 0.9, 0.74, 0.86, 3.2);
	}

	static shoulderRun(progress, timeMs) {
		const drift = Ease.drift(timeMs, 110, 1.4);
		return this.state(Ease.lerp(-34, 42, progress) + drift * 7, drift * 5, 1.18, drift * 1.8, 0.72, 0.62, 5.4);
	}

	static whipPan(progress) {
		const whip = Ease.spring(progress, 3.4, 7.4);
		return this.state(Ease.lerp(-160, 160, whip), 0, 1.08 + Ease.pulse(progress, 0.48, 0.18) * 0.13, -6 + whip * 12, 0.5, 0.8, 2);
	}

	static crashZoom(progress) {
		const impact = Ease.overshoot(progress, 0.2);
		return this.state(0, Ease.pulse(progress, 0.28, 0.2) * 9, 0.82 + impact * 0.68, 0, 0.9, 0.3, 2.8);
	}

	static droneDive(progress) {
		return this.state(Ease.lerp(130, -40, progress), Ease.lerp(-110, 26, Ease.smoother(progress)), Ease.lerp(0.62, 1.1, progress), Ease.lerp(-7, 3, progress), 0.66, 1);
	}

	static rackFocus(progress, timeMs) {
		return this.state(Ease.drift(timeMs, 2400) * 0.35, 0, 1.04, 0, Ease.smoother(progress), 0.24);
	}

	static snapZoom(progress) {
		const value = progress < 0.22 ? Ease.spring(progress / 0.22, 2, 8) : 1;
		return this.state(0, 0, 1 + value * 0.34, 0, 0.84, 0.22, 1.4);
	}

	static handheld(progress, timeMs) {
		const drift = Ease.drift(timeMs, 95, progress * 3);
		return this.state(drift * 5.5, Math.cos(timeMs / 73) * 4.2, 1.06, drift * 1.2, 0.52, 0.45, 4.2);
	}

	static state(x, y, zoom, roll, focus, parallax, shake = 0) {
		return { x, y, zoom, roll, focus, parallax, shake };
	}
}
