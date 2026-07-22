// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos sketches each stable branch before mesh density enters the
 * world. This Awtsmoos.com planner combines structural randomness, force,
 * trellis attraction, taper, and twist without touching foliage streams.
 */

import { Vec3 } from "../../../math/vec3.js";
import { calculateTreeTrellisForce } from "./treeTrellisField.js";
import {
	clampTreeSkeletonValue,
	roundTreeSkeletonValue,
	treeSkeletonValue
} from "./treeSkeletonMath.js";

function applyGlobalForce(context, direction, radius) {
	const force = context.config.branch?.force;
	if (!force?.direction || !force.strength) {
		return direction;
	}
	return Vec3.add(direction, Vec3.scale([
		Number(force.direction.x || 0),
		Number(force.direction.y ?? 1),
		Number(force.direction.z || 0)
	], Number(force.strength) / Math.max(0.15, radius)));
}

function applyGnarliness(context, direction, level) {
	const gnarliness = treeSkeletonValue(context.config, "gnarliness", level, 0);
	const random = context.streams.structure;
	return Vec3.add(direction, [
		random.random(-gnarliness, gnarliness),
		random.random(-gnarliness * 0.25, gnarliness * 0.25),
		random.random(-gnarliness, gnarliness)
	]);
}

function nextDirection(context, position, direction, level, radius) {
	let result = applyGnarliness(context, direction, level);
	result = applyGlobalForce(context, result, radius);
	result = Vec3.add(
		result,
		calculateTreeTrellisForce(position, context.config.trellis, radius)
	);
	return Vec3.normalize(result);
}

export function growTreeSkeletonBranch(context, request, branchIndex) {
	const id = `branch_${String(branchIndex).padStart(6, "0")}`;
	const sections = Math.max(2, Math.floor(
		treeSkeletonValue(context.config, "sections", request.level, 8)
	));
	const radialSegments = Math.max(3, Math.floor(
		treeSkeletonValue(context.config, "segments", request.level, 8)
	));
	const taper = clampTreeSkeletonValue(
		treeSkeletonValue(context.config, "taper", request.level, 0.75),
		0,
		1
	);
	const twistRadians = treeSkeletonValue(
		context.config,
		"twist",
		request.level,
		0
	) * Math.PI / 180;
	const nodes = [];
	let position = [...request.position];
	let direction = Vec3.normalize(request.direction);
	for (let section = 0; section <= sections; section += 1) {
		const progress = section / sections;
		nodes.push(Object.freeze({
			id: `${id}.node_${String(section).padStart(3, "0")}`,
			position: position.map(roundTreeSkeletonValue),
			direction: direction.map(roundTreeSkeletonValue),
			radius: roundTreeSkeletonValue(Math.max(
				0.0001,
				request.radius * (1 - taper * progress)
			)),
			twist: roundTreeSkeletonValue(twistRadians * progress),
			t: roundTreeSkeletonValue(progress)
		}));
		if (section < sections) {
			direction = nextDirection(context, position, direction, request.level, request.radius);
			position = Vec3.add(position, Vec3.scale(direction, request.length / sections));
		}
	}
	return Object.freeze({
		id,
		parentId: request.parentId,
		level: request.level,
		radialSegments,
		nodes: Object.freeze(nodes)
	});
}
