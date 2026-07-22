// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos divides one trunk into children and crowns them with leaves.
 * This Awtsmoos.com canopy planner consumes the established growth queue and
 * geometry builder rather than creating a competing botanical system.
 */
import { Vec3 } from "../../../math/vec3.js";
import { Quat } from "../../../math/quat.js";
import {
	GOLDEN_TREE_ANGLE,
	clampTreeValue,
	treeNumber,
	treeRadialDirection
} from "./treeGrowthMath.js";
import { calculateTreeChildRadius } from "./treePipeModel.js";

export function spawnTreeChildren(system, spine, parentLength, level) {
	const count = Math.max(0, Math.floor(system.get("children", level, 0)));
	if (!count) {
		return;
	}
	const start = clampTreeValue(system.get("start", level + 1, 0.2), 0, 0.98);
	const available = spine.length - 1;
	const offset = system.rng.random(0, Math.PI * 2);
	for (let childIndex = 0; childIndex < count; childIndex += 1) {
		const progress = start + (1 - start) * ((childIndex + system.rng.random()) / count);
		const nodeIndex = Math.min(available, Math.max(0, Math.floor(progress * available)));
		const node = spine[nodeIndex];
		const angle = system.get("angle", level + 1, 45) * Math.PI / 180;
		const radial = treeRadialDirection(node.direction, offset + childIndex * GOLDEN_TREE_ANGLE);
		const direction = Vec3.normalize(Vec3.add(
			Vec3.scale(node.direction, Math.cos(angle)),
			Vec3.scale(radial, Math.sin(angle))
		));
		const baseLength = system.get("length", level + 1, parentLength * 0.55);
		const evergreenScale = system.config.type === "evergreen" ? Math.max(0.18, 1 - progress) : 1;
		system.queue.push({
			position: [...node.position],
			rotation: Quat.setFromUnitVectors([0, 1, 0], direction),
			length: baseLength * evergreenScale * system.rng.random(0.86, 1.14),
			radius: calculateTreeChildRadius(
				node.radius,
				count,
				system.rng.random(0.52, 0.82)
			),
			level: level + 1
		});
	}
}

export function spawnTreeLeaves(system, spine, level, maximumLevel) {
	const leaves = system.config.leaves || {};
	const count = Math.max(0, Math.floor(treeNumber(leaves.count, 0)));
	if (!count) {
		return;
	}
	const defaultStart = level >= maximumLevel ? 0.12 : 0.3;
	const start = clampTreeValue(treeNumber(leaves.start, defaultStart), 0, 0.98);
	const available = spine.length - 1;
	const offset = system.rng.random(0, Math.PI * 2);
	for (let leafIndex = 0; leafIndex < count; leafIndex += 1) {
		const progress = start + (1 - start) * ((leafIndex + system.rng.random()) / count);
		const nodeIndex = Math.min(available, Math.max(0, Math.floor(progress * available)));
		const node = spine[nodeIndex];
		const radial = treeRadialDirection(node.direction, offset + leafIndex * GOLDEN_TREE_ANGLE);
		const variation = system.rng.random(0.82, 1.18);
		const size = treeNumber(leaves.size, 0.8) * variation;
		const pitch = treeNumber(leaves.angle, 12) * Math.PI / 180 + system.rng.random(-0.25, 0.25);
		const roll = system.rng.random(-0.45, 0.45);
		if (leafIndex % system.detail.leafStride !== 0) {
			continue;
		}
		const position = Vec3.add(node.position, Vec3.add(
			Vec3.scale(radial, node.radius * 1.4),
			Vec3.scale(node.direction, treeNumber(leaves.size, 0.8) * 0.22)
		));
		system.geo.addLeaf(
			position,
			Math.max(0.03, size * system.detail.leafScale),
			[pitch, Math.atan2(radial[0], radial[2]), roll],
			leaves.tint || leaves.color || [0.25, 0.65, 0.22, 1],
			{ billboard: system.detail.billboard || leaves.billboard, aspect: leaves.aspect }
		);
	}
}
