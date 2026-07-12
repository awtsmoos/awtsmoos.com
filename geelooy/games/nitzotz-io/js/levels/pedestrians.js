// B"H
import { heightAt, hsl, TAU } from '../math.js';

const COUNTS = { low: 18, medium: 32, high: 48 };

/** Lightweight walkers are persistent edible city objects, not transient particles. */
export function addPedestrians(objects, level, random, perf) {
	const count = Math.round((COUNTS[perf] || COUNTS.medium) * (0.8 + level.index * 0.08));
	for (let index = 0; index < count; index += 1) {
		objects.push(createPedestrian(objects.length, level, random, index));
	}
}

function createPedestrian(id, level, random, index) {
	const angle = random() * TAU;
	const distance = 180 + Math.sqrt(random()) * (level.bounds - 300);
	const x = Math.cos(angle) * distance;
	const y = Math.sin(angle) * distance;
	return {
		id, kind: 'pedestrian', name: 'City Walker', category: 'pedestrian', power: null,
		shape: 'cylinder', grounded: false, x, y, z: heightAt(x, y, level.index),
		r: 4.2, h: 15, mx: 3.1, my: 7.5, mz: 3.1, mass: 2.4, sparks: 28,
		rot: angle, color: hsl(level.hue + index * 37, 74, 66), district: districtFor(x, y),
		traffic: false, pedestrian: true, speed: 30 + random() * 22,
		walkAngle: random() * TAU, turnTimer: 0.6 + random() * 2, walkSeed: random() * 100,
		taken: false, sink: 0, sinkOwner: null
	};
}

function districtFor(x, y) {
	return `${x >= 0 ? 'E' : 'W'}${y >= 0 ? 'S' : 'N'}`;
}
