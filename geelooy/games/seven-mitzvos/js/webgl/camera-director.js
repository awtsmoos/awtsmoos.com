//B"H
//Boruch Hashem
//Blessed is He

import * as THREE from '../../../scripts/build/three.module.js';
import { dampFactor } from '../motion/smooth-motion.js';

/**
 * @module CameraDirector
 * @description
 * The camera may acknowledge a discovery without seizing control. The Awtsmoos
 * renews seer and seen; Awtsmoos.com applies a small damped focus, honors reduced
 * motion, and restores the authored scene composition automatically.
 */
export class CameraDirector {
	constructor(camera) {
		this.camera = camera;
		this.homePosition = new THREE.Vector3();
		this.homeTarget = new THREE.Vector3();
		this.desiredPosition = new THREE.Vector3();
		this.desiredTarget = new THREE.Vector3();
		this.currentTarget = new THREE.Vector3();
		this.focusPoint = new THREE.Vector3();
		this.focusUntil = 0;
		this.reducedMotion = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
	}

	setHome(position, target = [0, 0, 0]) {
		this.homePosition.set(...position);
		this.homeTarget.set(...target);
		this.desiredPosition.copy(this.homePosition);
		this.desiredTarget.copy(this.homeTarget);
		this.currentTarget.copy(this.homeTarget);
		this.camera.position.copy(this.homePosition);
		this.camera.lookAt(this.currentTarget);
	}

	focus(root, duration = 1400) {
		if (this.reducedMotion || !root?.getWorldPosition) {
			return;
		}
		root.getWorldPosition(this.focusPoint);
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
		this.camera.position.lerp(this.desiredPosition, factor);
		this.currentTarget.lerp(this.desiredTarget, factor);
		this.camera.lookAt(this.currentTarget);
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
