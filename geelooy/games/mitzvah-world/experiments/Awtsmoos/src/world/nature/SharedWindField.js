// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file SharedWindField.js
 * @description Moves real nature through the same advected weather law used by meadow grass and trees.
 * The Awtsmoos sends one traveling breath through every finite place; Awtsmoos.com lets flowers and bushes
 * inherit coherent fronts, crosswind, flutter, and traveler wake while their own cadence and authored yaw remain intact.
 */

import { sampleEnvironmentalWind } from '../environment/EnvironmentalWindField.js';
import { natureQualityBudget } from './NatureQualityBudget.js';
import { setEulerQuaternion } from './SharedWindQuaternion.js';

export { setEulerQuaternion } from './SharedWindQuaternion.js';

const SHARED_STRENGTH = 1;

export class SharedWindField {
	constructor(options = {}) {
		this.framesPerSecond = Math.max(1, options.framesPerSecond || 12);
		this.lastStep = -Infinity;
		this.lastOriginTime = null;
		this.lastOriginX = null;
		this.lastOriginZ = null;
		this.strength = options.strength ?? SHARED_STRENGTH;
		this.visibilityOrigin = options.visibilityOrigin || null;
		this.sample = {};
		this.context = {};
		this.updates = 0;
	}

	/** Advances all wind-responsive instances at a quality-bounded cadence. */
	update(seconds, instances = []) {
		if (seconds - this.lastStep < 1 / this.framesPerSecond) return false;
		this.writeOriginContext(seconds);
		this.lastStep = seconds;
		for (const instance of instances) this.move(instance, seconds);
		this.writeEvidenceSample(seconds);
		this.updates += 1;
		return true;
	}

	move(instance, seconds) {
		const placement = instance.placement;
		const amplitude = Number(placement.asset.windAmplitude || 0) * this.strength;
		if (!amplitude) return;
		this.context.baseStrength = 1;
		this.context.time = seconds;
		this.context.x = placement.x;
		this.context.z = placement.z;
		const weather = sampleEnvironmentalWind(this.sample, this.context);
		const bend = amplitude * weather.strength * (0.54 + weather.gust * 0.38);
		const flutter = weather.flutter * amplitude * 0.08;
		setEulerQuaternion(
			instance.scene.quaternion,
			weather.directionZ * bend + flutter,
			placement.yaw,
			-weather.directionX * bend + weather.crosswind * amplitude * 0.07
		);
	}

	snapshot() {
		return Object.freeze({
			advectionSpeed: finite(this.sample.advectionSpeed, 0),
			directionX: finite(this.sample.directionX, 0),
			directionZ: finite(this.sample.directionZ, 0),
			flutter: finite(this.sample.flutter, 0),
			framesPerSecond: this.framesPerSecond,
			gust: finite(this.sample.gust, 0),
			mode: 'advected-real-model-quaternion-sway',
			strength: finite(this.sample.strength, 0),
			updates: this.updates,
			wake: finite(this.sample.wake, 0)
		});
	}

	writeOriginContext(seconds) {
		const origin = this.visibilityOrigin?.();
		const x = finite(origin?.x, NaN);
		const z = finite(origin?.z, NaN);
		const delta = this.lastOriginTime === null
			? 0
			: Math.max(0.001, seconds - this.lastOriginTime);
		this.context.playerX = x;
		this.context.playerZ = z;
		this.context.wakeX = Number.isFinite(x) && this.lastOriginX !== null
			? (x - this.lastOriginX) / delta
			: 0;
		this.context.wakeZ = Number.isFinite(z) && this.lastOriginZ !== null
			? (z - this.lastOriginZ) / delta
			: 0;
		if (Number.isFinite(x)) this.lastOriginX = x;
		if (Number.isFinite(z)) this.lastOriginZ = z;
		this.lastOriginTime = seconds;
	}

	writeEvidenceSample(seconds) {
		this.context.baseStrength = 1;
		this.context.time = seconds;
		this.context.x = finite(this.context.playerX, 0);
		this.context.z = finite(this.context.playerZ, 0);
		sampleEnvironmentalWind(this.sample, this.context);
	}
}

/** Returns shared wind evidence used when no live model field exists. */
export function sharedWindEvidence(quality, mode = 'static-batched-renderer-limit') {
	return Object.freeze({
		framesPerSecond: natureQualityBudget(quality).windFps,
		mode,
		strength: SHARED_STRENGTH
	});
}

function finite(value, fallback) {
	return Number.isFinite(Number(value)) ? Number(value) : fallback;
}
