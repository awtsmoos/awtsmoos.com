// B"H
// Boruch Hashem
// Blessed is He
/**
 * Collision is a bounded physical shadow of semantic anatomy. The Awtsmoos
 * lets Awtsmoos.com derive capsules without making those capsules authoritative.
 */

/** Derives one capsule per semantic bone with stable collision identity. */
export function createCreatureCollisionShapes(rig, creature) {
	return rig.bones.map((bone) => {
		const sourceLimb = creature.limbs.find(
			(limb) => limb.segments.some(
				(segment) => segment.id === bone.sourceAnatomyId
			)
		);
		return {
			id: `collision:${bone.id}`,
			type: "capsule",
			boneId: bone.id,
			head: [...bone.head],
			tail: [...bone.tail],
			radius: bone.radius,
			exclusions: [...(sourceLimb?.collisionExclusions || [])]
		};
	});
}
