// B"H
// Boruch Hashem
// Blessed is He

import { CameraMotionLibrary } from './camera/CameraMotionLibrary.js';

/**
 * The camera is not a floating label but an embodied witness. The Awtsmoos
 * renews every viewpoint while Awtsmoos.com resolves lens, motion, horizon,
 * focus, parallax, and lead room from the editable shot itself.
 */
export class CinematicCameraResolver {
	static resolve(shot, timeMs) {
		const progress = this.progress(shot, timeMs);
		const motion = CameraMotionLibrary.resolve(
			shot.camera?.move || 'locked',
			progress,
			timeMs,
			shot
		);
		const angle = this.angle(shot.camera?.angle);
		const lens = this.lens(shot.camera?.lens || this.defaultLens(shot.camera?.size));
		const baseScale = this.size(shot.camera?.size);
		return {
			...motion,
			view: angle.view,
			groundShift: angle.groundShift + motion.y,
			scale: baseScale * angle.scale * lens.scale * motion.zoom,
			roll: angle.roll + motion.roll,
			focus: shot.camera?.focus ?? motion.focus,
			parallax: shot.camera?.parallax ?? motion.parallax,
			shake: shot.camera?.shake ?? motion.shake,
			leadRoom: shot.camera?.leadRoom || 0,
			lens: lens.name,
			focalLength: lens.focalLength,
			progress
		};
	}

	static progress(shot, timeMs) {
		return Math.max(0, Math.min(1, (timeMs - shot.start) / Math.max(1, shot.duration)));
	}

	static size(size) {
		return {
			extremeCloseUp: 1.92,
			closeUp: 1.56,
			reaction: 1.43,
			overShoulder: 1.2,
			twoShot: 1.08,
			insert: 0.84,
			tracking: 0.94,
			group: 0.8,
			wide: 0.76,
			extremeWide: 0.58
		}[size] || 0.92;
	}

	static angle(name) {
		return {
			profile: this.angleState('sideRight', 0, 1, 0),
			side: this.angleState('sideRight', 0, 1, 0),
			threeQuarter: this.angleState('threeQuarterRight', -2, 1, 0),
			rearThreeQuarter: this.angleState('threeQuarterLeft', -4, 0.96, 0),
			topDown: this.angleState('front', -48, 0.73, 0),
			birdEye: this.angleState('front', -86, 0.58, 0),
			highAngle: this.angleState('front', -30, 0.84, 0),
			lowAngle: this.angleState('front', 19, 1.17, 0),
			dutch: this.angleState('threeQuarterRight', 5, 1.06, -8),
			wormEye: this.angleState('front', 34, 1.26, 0),
			aerialOblique: this.angleState('threeQuarterRight', -60, 0.68, 3),
			eyeLevel: this.angleState('front', 0, 1, 0)
		}[name] || this.angleState('front', 0, 1, 0);
	}

	static lens(name) {
		return {
			ultraWide: { name: 'ultraWide', focalLength: 18, scale: 0.9 },
			wide: { name: 'wide', focalLength: 24, scale: 0.95 },
			normal: { name: 'normal', focalLength: 40, scale: 1 },
			portrait: { name: 'portrait', focalLength: 65, scale: 1.06 },
			telephoto: { name: 'telephoto', focalLength: 105, scale: 1.12 }
		}[name] || { name: 'normal', focalLength: 40, scale: 1 };
	}

	static defaultLens(size) {
		if (size === 'extremeWide' || size === 'wide') return 'wide';
		if (size === 'extremeCloseUp' || size === 'closeUp') return 'portrait';
		return 'normal';
	}

	static angleState(view, groundShift, scale, roll) {
		return { view, groundShift, scale, roll };
	}
}
