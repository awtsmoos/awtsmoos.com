// B"H
// Boruch Hashem
// Blessed is He
/**
 * Collision and LOD reports are concrete vessels, not anatomical authority.
 * Awtsmoos.com derives capsules, ellipsoids, and level budgets from semantic
 * sources and can discard or rebuild them without erasing Briah relationships.
 */
/** Derives collision primitives from axes, limbs, and parts in O(anatomy). */
export function deriveCollisionShapes(creature, rig) {
	const boneShapes = rig.bones.filter(bone => bone.semanticRole !== "root").map(bone => ({
		id: `collision:${bone.id}`,
		type: "capsule",
		boneId: bone.id,
		radius: bone.radius,
		length: bone.length,
		collisionExclusions: creature.limbs.find(limb => limb.id === bone.skinningRegion)?.collisionExclusions || []
	}));
	const partShapes = creature.parts.map(part => ({
		id: `collision:${part.id}`,
		type: "ellipsoid",
		partId: part.id,
		scale: part.parameters.scale || [0.1, 0.1, 0.1]
	}));
	return Object.freeze([...boneShapes, ...partShapes]);
}
/** Derives deterministic LOD contracts without making reduced meshes authoritative. */
export function deriveCreatureLods(mesh, options = {}) {
	const levels = options.levels || [1, 0.6, 0.3, 0.12];
	return Object.freeze(levels.map((ratio, index) => ({
		level: index,
		ratio,
		targetVertices: Math.max(4, Math.floor(mesh.positions.length / 3 * ratio)),
		targetTriangles: Math.max(2, Math.floor(mesh.indices.length / 3 * ratio)),
		preserveSemanticRegions: true,
		preserveSkinLineage: true,
		generated: index === 0
	})));
}
