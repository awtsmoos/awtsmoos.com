// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos draws an invisible spine before bark receives vertices.
 * This Awtsmoos.com planner combines seeded gnarliness, global force, twist,
 * and one bounded trellis field while every LOD shares the same skeleton.
 */
import { Vec3 } from "../../../math/vec3.js";
import { Quat } from "../../../math/quat.js";
import { treeNumber } from "./treeGrowthMath.js";
import { calculateTreeTrellisForce } from "./treeTrellisField.js";

function addGlobalForce(system, direction, radius) {
	const force = system.config.branch.force;
	if (!force?.direction || !force.strength) {
		return direction;
	}
	const vector = [
		treeNumber(force.direction.x),
		treeNumber(force.direction.y, 1),
		treeNumber(force.direction.z)
	];
	return Vec3.add(direction, Vec3.scale(
		vector,
		treeNumber(force.strength) / Math.max(0.15, radius)
	));
}

function addGnarliness(system, direction, gnarliness) {
	if (!gnarliness) {
		return direction;
	}
	return Vec3.add(direction, [
		system.rng.random(-gnarliness, gnarliness),
		system.rng.random(-gnarliness * 0.25, gnarliness * 0.25),
		system.rng.random(-gnarliness, gnarliness)
	]);
}

function nextTreeDirection(system, position, direction, gnarliness, radius) {
	let result = addGnarliness(system, [...direction], gnarliness);
	result = addGlobalForce(system, result, radius);
	result = Vec3.add(
		result,
		calculateTreeTrellisForce(position, system.config.trellis, radius)
	);
	return Vec3.normalize(result);
}

export function planTreeBranch(system, task, sections) {
	const taper = system.get("taper", task.level, 0.7);
	const gnarliness = system.get("gnarliness", task.level, 0.05);
	const twistRadians = system.get("twist", task.level, 0) * Math.PI / 180;
	const segmentLength = task.length / sections;
	let position = [...task.position];
	let baseRotation = [...task.rotation];
	let direction = Quat.applyToVec3([0, 1, 0], baseRotation);
	const spine = [];
	for (let section = 0; section <= sections; section += 1) {
		const progress = section / sections;
		const twist = Quat.setFromAxisAngle([0, 1, 0], twistRadians * progress);
		spine.push({
			position: [...position],
			rotation: Quat.multiply(baseRotation, twist),
			direction: [...direction],
			radius: Math.max(0.008, task.radius * (1 - taper * progress)),
			progress,
			distance: task.length * progress
		});
		if (section < sections) {
			direction = nextTreeDirection(system, position, direction, gnarliness, task.radius);
			const target = Quat.setFromUnitVectors([0, 1, 0], direction);
			baseRotation = Quat.slerp(baseRotation, target, 0.35);
			position = Vec3.add(position, Vec3.scale(direction, segmentLength));
		}
	}
	return spine;
}

export function emitTreeBranch(system, spine, radialSegments) {
	let previousRing = -1;
	for (let index = 0; index < spine.length; index += 1) {
		const boundary = index === 0 || index === spine.length - 1;
		if (!boundary && index % system.detail.sectionStride !== 0) {
			continue;
		}
		const node = spine[index];
		const ring = system.geo.addBranchSection(
			node.position,
			node.rotation,
			node.radius,
			radialSegments,
			node.distance
		);
		if (previousRing >= 0) {
			system.geo.stitch(previousRing, ring, radialSegments);
		}
		previousRing = ring;
	}
	const tip = spine.at(-1);
	system.geo.addCap(tip.position, tip.rotation, previousRing, radialSegments, tip.distance);
}
