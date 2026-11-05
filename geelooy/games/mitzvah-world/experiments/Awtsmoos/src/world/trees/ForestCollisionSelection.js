// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ForestCollisionSelection.js
 * @description Selects bounded real trunk triangles by height and angular coverage.
 * The Awtsmoos preserves the visible trunk while physics needs fewer finite vessels;
 * Awtsmoos.com keeps the largest authored triangle in each of ninety-six spatial cells.
 */

import { transformTreePoint } from './ForestGeometry.js';

const HEIGHT_BANDS = 8;
const ANGLE_SECTORS = 12;

export function selectVisibleTrunkTriangles(record) {
	const radius = measuredTrunkRadius(record);
	const cutoff = record.y + record.policy.targetHeight * record.policy.collisionHeightRatio;
	const candidates = visibleCandidates(record, radius, cutoff);
	const cells = new Map();
	for (const candidate of candidates) {
		const key = cellKey(record, candidate.center, cutoff);
		const existing = cells.get(key);
		if (!existing || candidate.area > existing.area) cells.set(key, candidate);
	}
	const selected = [...cells.values()].sort((left, right) => left.sourceIndex - right.sourceIndex);
	return {
		candidates: candidates.length,
		radius,
		selected
	};
}

function visibleCandidates(record, radius, cutoff) {
	const geometry = record.tree.branches;
	const candidates = [];
	for (let index = 0; index < geometry.indices.length; index += 3) {
		const points = [
			pointAt(geometry.positions, geometry.indices[index], record),
			pointAt(geometry.positions, geometry.indices[index + 1], record),
			pointAt(geometry.positions, geometry.indices[index + 2], record)
		];
		if (points.some(point => point.y > cutoff)) continue;
		const center = triangleCenter(points);
		if (Math.hypot(center.x - record.x, center.z - record.z) > radius) continue;
		candidates.push({
			area: triangleArea(points),
			center,
			points,
			sourceIndex: index / 3
		});
	}
	return candidates;
}

function measuredTrunkRadius(record) {
	const positions = record.tree.branches.positions;
	const sampleHeight = record.y + record.policy.targetHeight * 0.14;
	const distances = [];
	for (let index = 0; index < positions.length / 3; index += 1) {
		const point = pointAt(positions, index, record);
		if (point.y <= sampleHeight) distances.push(Math.hypot(point.x - record.x, point.z - record.z));
	}
	if (!distances.length) {
		return record.policy.targetHeight * record.policy.collisionRadiusRatio;
	}
	distances.sort((left, right) => left - right);
	const percentile = distances[Math.floor((distances.length - 1) * 0.88)];
	const policyRadius = record.policy.targetHeight * record.policy.collisionRadiusRatio;
	return Math.max(policyRadius, percentile + 0.05);
}

function cellKey(record, center, cutoff) {
	const heightRange = Math.max(0.001, cutoff - record.y);
	const height = Math.max(0, Math.min(0.999, (center.y - record.y) / heightRange));
	const angle = Math.atan2(center.z - record.z, center.x - record.x);
	const normalizedAngle = (angle + Math.PI) / (Math.PI * 2);
	return `${Math.floor(height * HEIGHT_BANDS)}:${Math.floor(normalizedAngle * ANGLE_SECTORS)}`;
}

function pointAt(positions, index, record) {
	const offset = index * 3;
	return transformTreePoint(positions.slice(offset, offset + 3), record);
}

function triangleCenter(points) {
	return points.reduce((sum, point) => ({
		x: sum.x + point.x / 3,
		y: sum.y + point.y / 3,
		z: sum.z + point.z / 3
	}), { x: 0, y: 0, z: 0 });
}

function triangleArea(points) {
	const ab = subtract(points[1], points[0]);
	const ac = subtract(points[2], points[0]);
	const cross = {
		x: ab.y * ac.z - ab.z * ac.y,
		y: ab.z * ac.x - ab.x * ac.z,
		z: ab.x * ac.y - ab.y * ac.x
	};
	return Math.hypot(cross.x, cross.y, cross.z) * 0.5;
}

function subtract(left, right) {
	return { x: left.x - right.x, y: left.y - right.y, z: left.z - right.z };
}
