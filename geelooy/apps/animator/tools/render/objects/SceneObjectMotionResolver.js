// B"H
// Boruch Hashem
// Blessed is He

/**
 * Static objects, slides, rolls, falls, bounces, spins, flashes, steam, and print
 * actions become deterministic frame states. The Awtsmoos renews each instant;
 * Awtsmoos.com keeps preview and export on one clock without hidden object drift.
 */
export class SceneObjectMotionResolver {
	static resolve(object, timeMs) {
		const progress = this.progress(object, timeMs);
		const motion = object.motion || { type: 'static' };
		const base = {
			x: Number(object.x || 0),
			y: Number(object.y || 0),
			scale: Number(object.scale || 1),
			rotation: Number(object.rotation || 0),
			progress
		};
		return { ...base, ...this.motion(motion, base, progress, timeMs) };
	}

	static motion(motion, base, progress, timeMs) {
		const type = motion.type || 'static';
		const toX = Number(motion.toX ?? base.x);
		const toY = Number(motion.toY ?? base.y);
		const eased = this.ease(progress);
		const states = {
			static: {},
			slide: { x: this.lerp(base.x, toX, eased), y: this.lerp(base.y, toY, eased) },
			roll: { x: this.lerp(base.x, toX, eased), y: this.lerp(base.y, toY, eased), rotation: progress * Math.PI * 4 },
			fall: { x: this.lerp(base.x, toX, progress), y: this.lerp(base.y, toY, progress * progress) },
			bounce: { x: this.lerp(base.x, toX, eased), y: this.lerp(base.y, toY, eased) - Math.sin(progress * Math.PI) * Number(motion.height || 34) },
			spin: { x: this.lerp(base.x, toX, eased), y: this.lerp(base.y, toY, eased), rotation: progress * Math.PI * Number(motion.turns || 6) },
			flash: { flash: Math.floor(timeMs / 180) % 2 === 0 },
			steam: { steam: true, spread: Math.sin(timeMs / 240) * 0.3 },
			print: { printing: progress > 0.16, y: base.y + progress * Number(motion.travel || 12) },
			flutter: { x: this.lerp(base.x, toX, eased), y: this.lerp(base.y, toY, eased) + Math.sin(progress * Math.PI * 5) * 8, spread: progress }
		};
		return states[type] || {};
	}

	static progress(object, timeMs) {
		return Math.max(0, Math.min(1, (timeMs - object.start) / Math.max(1, object.duration)));
	}

	static ease(progress) {
		return progress * progress * (3 - 2 * progress);
	}

	static lerp(from, to, progress) {
		return from + (to - from) * progress;
	}
}
