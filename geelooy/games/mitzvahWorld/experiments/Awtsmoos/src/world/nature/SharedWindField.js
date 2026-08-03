// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file SharedWindField.js
 * @description Moves real plants and publishes one truthful wind covenant for static batches.
 * The Awtsmoos sends one hidden song through branch, bush, flower, and blade in time;
 * Awtsmoos.com moves supported scenes and names static limits without pretending a shader rhyme.
 */

import { natureQualityBudget } from './NatureQualityBudget.js';

const SHARED_PHASE = 0.37;
const SHARED_STRENGTH = 1;

export class SharedWindField {
	constructor(options = {}) {
		this.framesPerSecond = Math.max(1, options.framesPerSecond || 12);
		this.lastStep = -Infinity;
		this.phase = options.phase ?? SHARED_PHASE;
		this.strength = options.strength ?? SHARED_STRENGTH;
	}

	/** Advances all wind-responsive instances at a quality-bounded cadence. */
	update(seconds, instances = []) {
		if (seconds - this.lastStep < 1 / this.framesPerSecond) {
			return false;
		}
		this.lastStep = seconds;
		for (const instance of instances) {
			this.move(instance, seconds);
		}
		return true;
	}

	move(instance, seconds) {
		const placement = instance.placement;
		const amplitude = placement.asset.windAmplitude * this.strength;
		if (!amplitude) {
			return;
		}
		const gust = Math.sin(seconds * 0.82 + placement.index * 1.71 + this.phase);
		const sway = gust * amplitude;
		setEulerQuaternion(instance.scene.quaternion, sway, placement.yaw, sway * 0.45);
	}

	snapshot() {
		return windEvidence(this.framesPerSecond, 'real-model-quaternion-sway');
	}
}

/** Returns the shared wind evidence used by static procedural batches. */
export function sharedWindEvidence(quality, mode = 'static-batched-renderer-limit') {
	return windEvidence(natureQualityBudget(quality).windFps, mode);
}

function windEvidence(framesPerSecond, mode) {
	return Object.freeze({
		framesPerSecond,
		mode,
		phase: SHARED_PHASE,
		strength: SHARED_STRENGTH
	});
}

/** Writes one normalized XYZ Euler rotation into a tiny-runtime quaternion. */
export function setEulerQuaternion(quaternion, x, y, z) {
	const sx = Math.sin(x / 2);
	const cx = Math.cos(x / 2);
	const sy = Math.sin(y / 2);
	const cy = Math.cos(y / 2);
	const sz = Math.sin(z / 2);
	const cz = Math.cos(z / 2);
	return quaternion.set(
		sx * cy * cz + cx * sy * sz,
		cx * sy * cz - sx * cy * sz,
		cx * cy * sz + sx * sy * cz,
		cx * cy * cz - sx * sy * sz
	);
}
