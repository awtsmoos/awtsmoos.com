// B"H
import { createHouseFenceSegments } from '../house/HouseFenceSystem.js';
import { localToWorld } from '../house/HouseSpec.js';
import { obstacleBounds } from './ObstacleGeometry.js';

export function createObstacleDefinitions(definitions, houseSpecs, clearance) {
	const houseIds = new Set(houseSpecs.map((spec) => spec.id));
	return [
		...houseSpecs.map((spec) => houseObstacle(spec, clearance)),
		...houseSpecs.flatMap((spec) => fenceObstacles(spec, clearance)),
		...definitions
			.filter((definition) => staticExternalDefinition(definition, houseIds))
			.map((definition) => definitionObstacle(definition, clearance))
			.filter(Boolean)
	];
}

export function obstacleFieldBounds(obstacles) {
	const bounds = obstacles.map(obstacleBounds);
	return {
		minX: Math.min(...bounds.map((item) => item.minX), -120),
		maxX: Math.max(...bounds.map((item) => item.maxX), 160),
		minZ: Math.min(...bounds.map((item) => item.minZ), -160),
		maxZ: Math.max(...bounds.map((item) => item.maxZ), 120)
	};
}

function houseObstacle(spec, clearance) {
	const halfWidth = spec.width / 2 + clearance;
	const halfDepth = spec.depth / 2 + clearance;
	return polygonObstacle(`${spec.id}-footprint`, [
		localToWorld(spec, -halfWidth, -halfDepth),
		localToWorld(spec, halfWidth, -halfDepth),
		localToWorld(spec, halfWidth, halfDepth),
		localToWorld(spec, -halfWidth, halfDepth)
	], 'house');
}

function fenceObstacles(spec, clearance) {
	return createHouseFenceSegments(spec).map(([start, end], index) => Object.freeze({
		id: `${spec.id}-fence-${index + 1}`,
		type: 'capsule',
		source: 'fence',
		start,
		end,
		radius: clearance + 0.14
	}));
}

function staticExternalDefinition(definition, houseIds) {
	if (definition.solid === false || definition.walkable === true || definition.userData?.AwtsmoosFence) {
		return false;
	}
	return ![...houseIds].some((houseId) => definition.id?.startsWith(houseId));
}

function definitionObstacle(definition, clearance) {
	if (definition.size) {
		return orientedBoxObstacle(definition, clearance);
	}
	const points = (definition.vertices || []).map((point) => transform(point, definition));
	if (!points.length) return null;
	return polygonObstacle(definition.id, rectanglePoints(boundsOf(points, clearance)), 'static');
}

function orientedBoxObstacle(definition, clearance) {
	const halfX = definition.size.x / 2 + clearance;
	const halfZ = definition.size.z / 2 + clearance;
	return polygonObstacle(definition.id, [
		transform([-halfX, 0, -halfZ], definition),
		transform([halfX, 0, -halfZ], definition),
		transform([halfX, 0, halfZ], definition),
		transform([-halfX, 0, halfZ], definition)
	], 'static');
}

function transform(point, definition) {
	const [x, , z] = Array.isArray(point) ? point : [point.x, point.y, point.z];
	const yaw = definition.rotation?.y || definition.yaw || 0;
	const cosine = Math.cos(yaw);
	const sine = Math.sin(yaw);
	return {
		x: (definition.position?.x || 0) + x * cosine - z * sine,
		z: (definition.position?.z || 0) + x * sine + z * cosine
	};
}

function polygonObstacle(id, points, source) {
	return Object.freeze({ id, type: 'polygon', source, points: Object.freeze(points) });
}

function boundsOf(points, clearance) {
	return {
		minX: Math.min(...points.map((point) => point.x)) - clearance,
		maxX: Math.max(...points.map((point) => point.x)) + clearance,
		minZ: Math.min(...points.map((point) => point.z)) - clearance,
		maxZ: Math.max(...points.map((point) => point.z)) + clearance
	};
}

function rectanglePoints(bounds) {
	return [
		{ x: bounds.minX, z: bounds.minZ },
		{ x: bounds.maxX, z: bounds.minZ },
		{ x: bounds.maxX, z: bounds.maxZ },
		{ x: bounds.minX, z: bounds.maxZ }
	];
}
