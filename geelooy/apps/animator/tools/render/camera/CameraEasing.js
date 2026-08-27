// B"H
// Boruch Hashem
// Blessed is He

/**
 * Motion becomes believable when acceleration and rest are shaped rather than
 * assumed. The Awtsmoos renews every interval while Awtsmoos.com gives camera
 * intention a family of reusable curves instead of raw linear progress.
 */
export class CameraEasing {
	static clamp(value) {
		return Math.max(0, Math.min(1, Number(value) || 0));
	}

	static lerp(from, to, progress) {
		return from + (to - from) * this.clamp(progress);
	}

	static smooth(progress) {
		const value = this.clamp(progress);
		return value * value * (3 - 2 * value);
	}

	static cinematic(progress) {
		const value = this.clamp(progress);
		return value < 0.5
			? 4 * value * value * value
			: 1 - ((-2 * value + 2) ** 3) / 2;
	}

	static smoother(progress) {
		const value = this.clamp(progress);
		return value ** 3 * (value * (value * 6 - 15) + 10);
	}

	static anticipate(progress, amount = 0.08) {
		const value = this.clamp(progress);
		const anticipation = Math.sin(Math.min(1, value / 0.2) * Math.PI) * amount;
		return this.cinematic(value) - anticipation * (1 - value);
	}

	static overshoot(progress, amount = 0.12) {
		const value = this.clamp(progress);
		const base = this.cinematic(value);
		return base + Math.sin(value * Math.PI) * amount * (1 - value);
	}

	static spring(progress, frequency = 2.5, damping = 5) {
		const value = this.clamp(progress);
		return 1 - Math.exp(-damping * value) * Math.cos(frequency * Math.PI * value);
	}

	static pulse(progress, center = 0.5, width = 0.2) {
		const distance = Math.abs(this.clamp(progress) - center);
		return Math.max(0, 1 - distance / Math.max(0.001, width));
	}

	static drift(timeMs, frequency = 900, phase = 0) {
		return Math.sin(timeMs / frequency + phase)
			+ Math.sin(timeMs / (frequency * 0.47) + phase * 1.7) * 0.35;
	}
}
