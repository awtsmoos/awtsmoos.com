//B"H
//Boruch Hashem
//Blessed is He

import { dampFactor } from '../motion/smooth-motion.js';
import {
	aimNativeCamera,
	lerpNativeVector,
	nativeVector,
	nativeWorldPosition
} from './native-scene-math.js';

/**
 * @module CameraDirector
 * @description
 * The camera may acknowledge a discovery without seizing control. The Awtsmoos
 * renews seer and seen; Awtsmoos.com applies a small damped focus, honors reduced
 * motion, and restores authored composition through native scene math alone.
 */
export class CameraDirector {
	constructor(camera) {
		this.camera = camera;
		this.homePosition = nativeVector();
		this.homeTarget = nativeVector();
		this.desiredPosition = nativeVector();
		this.desiredTarget = nativeVector();
		this.currentTarget = nativeVector();
		this.focusPoint = nativeVector();
		this.focusUntil = 0;
		this.reducedMotion = typeof matchMedia === 'function'
			&& matchMedia('(prefers-reduced-motion: reduce)').matches;
	}

	setHome(position, target = [0, 0, 0]) {
		this.homePosition.set(...position);
		this.homeTarget.set(...target);
		this.desiredPosition.copy(this.homePosition);
		this.desiredTarget.copy(this.homeTarget);
		this.currentTarget.copy(this.homeTarget);
		this.camera.position.copy(this.homePosition);
		aimNativeCamera(this.camera, this.currentTarget);
	}

	focus(root, duration = 1400) {
		if (this.reducedMotion || !root) {
			return;
		}
		nativeWorldPosition(root, this.focusPoint);
		this.desiredTarget.copy(this.focusPoint);
		this.desiredTarget.y += 0.55;
		this.desiredPosition.copy(this.homePosition);
		this.desiredPosition.x += (this.focusPoint.x - this.homeTarget.x) * 0.08;
		this.desiredPosition.y += (this.focusPoint.y - this.homeTarget.y) * 0.04;
		this.desiredPosition.z += (this.focusPoint.z - this.homeTarget.z) * 0.06;
		this.focusUntil = performance.now() + duration;
	}

	update(delta) {
		if (this.focusUntil && performance.now() >= this.focusUntil) {
			this.restore();
		}
		const factor = dampFactor(5.5, delta);
		lerpNativeVector(this.camera.position, this.desiredPosition, factor);
		lerpNativeVector(this.currentTarget, this.desiredTarget, factor);
		aimNativeCamera(this.camera, this.currentTarget);
	}

	restore() {
		this.focusUntil = 0;
		this.desiredPosition.copy(this.homePosition);
		this.desiredTarget.copy(this.homeTarget);
	}

	mode() {
		return this.focusUntil ? 'focus' : 'home';
	}
}
