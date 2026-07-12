// B"H
import { clamp, heightAt, hsl, rng, TAU } from '../math.js';
import { modelVariantKey } from '../modelKey.js';
import { itemDefinition, weightedKinds } from './items.js';
import { addPedestrians } from './pedestrians.js';

const POPULATION = { low: 280, medium: 470, high: 700 };
const LANES = [-0.36, -0.18, 0, 0.18, 0.36];

/** Build one persistent district-aware arena with roads, crowds, traffic, and landmarks. */
export function buildArena(level, perf = 'high') {
	const random = rng(level.seed);
	const kinds = weightedKinds(level.weights);
	const total = Math.round((POPULATION[perf] || POPULATION.medium) * level.density);
	const objects = [];
	addSafeOpening(objects, level, random, kinds);
	while (objects.length < total) objects.push(makeObject(objects.length, level, random, kinds));
	addLandmarks(objects, level, random);
	addPedestrians(objects, level, random, perf);
	return objects;
}

function addSafeOpening(objects, level, random, kinds) {
	const safeKinds = kinds.filter(kind => itemDefinition(kind).r <= 15);
	for (let index = 0; index < 64; index += 1) {
		const angle = index / 64 * TAU + random() * 0.18;
		const distance = 120 + random() * 430;
		objects.push(makePlaced(objects.length, safeKinds[index % safeKinds.length] || 'letter', level, random, {
			x: Math.cos(angle) * distance, y: Math.sin(angle) * distance, rot: random() * TAU
		}));
	}
}

function makeObject(id, level, random, kinds) {
	const kind = kinds[Math.floor(random() * kinds.length)];
	const item = itemDefinition(kind);
	const placement = item.traffic ? trafficPlacement(id, level, random) : cityPlacement(item, level, random);
	return makePlaced(id, kind, level, random, placement);
}

function makePlaced(id, kind, level, random, placement) {
	const item = itemDefinition(kind);
	const noise = 0.9 + random() * 0.22;
	const x = clamp(placement.x, -level.bounds + 90, level.bounds - 90);
	const y = clamp(placement.y, -level.bounds + 90, level.bounds - 90);
	return {
		id, kind, name: item.label, category: item.category, power: item.power || null,
		shape: item.model ? modelVariantKey(item.model, id) : item.shape, grounded: Boolean(item.model),
		x, y, z: heightAt(x, y, level.index), r: item.r * noise, h: item.h * noise,
		mx: item.meshScale[0] * noise, my: item.meshScale[1] * noise, mz: item.meshScale[2] * noise,
		mass: item.mass * noise, sparks: Math.round(item.sparks * noise), rot: placement.rot,
		color: hsl(level.hue + id * 13 + item.mass, 72, 58), district: districtFor(x, y),
		traffic: Boolean(item.traffic), routeAxis: placement.axis || null, routeDirection: placement.direction || 0,
		speed: item.traffic ? 70 + random() * 85 : 0, taken: false, sink: 0, sinkOwner: null, locked: false
	};
}

function cityPlacement(item, level, random) {
	const angle = random() * TAU;
	const radius = Math.sqrt(random()) * (level.bounds - 140);
	let x = Math.cos(angle) * radius;
	let y = Math.sin(angle) * radius;
	if (item.category === 'building' || item.category === 'landmark') {
		x = snap(x, 180) + (random() - 0.5) * 46;
		y = snap(y, 180) + (random() - 0.5) * 46;
	}
	return { x, y, rot: Math.floor(random() * 4) * Math.PI / 2 };
}

function trafficPlacement(id, level, random) {
	const axis = id % 2 ? 'x' : 'y';
	const lane = LANES[id % LANES.length] * level.bounds;
	const along = (random() * 2 - 1) * level.bounds * 0.92;
	const direction = random() > 0.5 ? 1 : -1;
	return { x: axis === 'x' ? along : lane, y: axis === 'y' ? along : lane, axis, direction, rot: 0 };
}

function addLandmarks(objects, level, random) {
	const kinds = ['fountain', 'studyHall', 'tower', 'monument', 'palace'];
	for (let index = 0; index < 14; index += 1) {
		const angle = index / 14 * TAU;
		objects.push(makePlaced(objects.length, kinds[(index + level.index) % kinds.length], level, random, {
			x: Math.cos(angle) * level.bounds * 0.74, y: Math.sin(angle) * level.bounds * 0.74, rot: angle + Math.PI
		}));
	}
}

function districtFor(x, y) {
	return `${x >= 0 ? 'E' : 'W'}${y >= 0 ? 'S' : 'N'}`;
}

function snap(value, size) {
	return Math.round(value / size) * size;
}
