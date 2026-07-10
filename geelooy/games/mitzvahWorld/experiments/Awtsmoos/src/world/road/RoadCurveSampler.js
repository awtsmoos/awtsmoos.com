// B"H
import { segmentBlocked } from './StaticObstacleField.js';

/** Rounds path corners only when every sampled curve segment remains clear. */
export function curveRoadPath(points, obstacleField, spacing = 1.15) {
	if (points.length < 3) {
		return resamplePolyline(points, spacing);
	}
	const curved = [points[0]];
	for (let index = 1; index < points.length - 1; index += 1) {
		const before = points[index - 1];
		const corner = points[index];
		const after = points[index + 1];
		const radius = Math.min(
			distance(before, corner),
			distance(corner, after),
			5.5
		) * 0.32;
		const entry = toward(corner, before, radius);
		const exit = toward(corner, after, radius);
		appendLine(curved, entry, spacing);
		const candidate = quadraticSamples(entry, corner, exit, 8);
		if (curveIsClear(curved.at(-1), candidate, obstacleField)) {
			curved.push(...candidate);
		} else {
			appendLine(curved, corner, spacing);
		}
	}
	appendLine(curved, points.at(-1), spacing);
	curved[0] = { ...points[0] };
	curved[curved.length - 1] = { ...points.at(-1) };
	return deduplicate(curved);
}

export function maximumRoadSampleGap(points) {
	let maximum = 0;
	for (let index = 1; index < points.length; index += 1) {
		maximum = Math.max(maximum, distance(points[index - 1], points[index]));
	}
	return maximum;
}

function quadraticSamples(start, control, end, count) {
	return Array.from({ length: count }, (_, index) => {
		const t = (index + 1) / count;
		const inverse = 1 - t;
		return {
			x: inverse * inverse * start.x + 2 * inverse * t * control.x + t * t * end.x,
			z: inverse * inverse * start.z + 2 * inverse * t * control.z + t * t * end.z
		};
	});
}

function curveIsClear(start, samples, field) {
	let previous = start;
	for (const sample of samples) {
		if (segmentBlocked(field, previous, sample)) return false;
		previous = sample;
	}
	return true;
}

function resamplePolyline(points, spacing) {
	const output = points.length ? [{ ...points[0] }] : [];
	for (const point of points.slice(1)) appendLine(output, point, spacing);
	return output;
}

function appendLine(output, target, spacing) {
	const start = output.at(-1);
	if (!start) {
		output.push({ ...target });
		return;
	}
	const length = distance(start, target);
	const count = Math.max(1, Math.ceil(length / spacing));
	for (let index = 1; index <= count; index += 1) {
		const t = index / count;
		output.push({
			x: start.x + (target.x - start.x) * t,
			z: start.z + (target.z - start.z) * t
		});
	}
}

function toward(origin, target, amount) {
	const length = distance(origin, target) || 1;
	const ratio = Math.min(1, amount / length);
	return {
		x: origin.x + (target.x - origin.x) * ratio,
		z: origin.z + (target.z - origin.z) * ratio
	};
}

function deduplicate(points) {
	return points.filter((point, index) => (
		index === 0 || distance(point, points[index - 1]) > 0.005
	));
}

function distance(left, right) {
	return Math.hypot(right.x - left.x, right.z - left.z);
}
