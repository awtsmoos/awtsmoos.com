//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the build skeleton vessel in this instant, revealing
 * its focused js skeleton service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
import { BONE_SCHEMA } from './boneSchema.js';
/** B"H — builds bones from data; no sprite is worshiped here. */
export function buildSkeleton(f) {
	const bones = {};
	for (const [id, parent, ox, oy, len] of BONE_SCHEMA) {
		bones[id] = {
			id,
			parent,
			ox: ox * f.dna.height,
			oy: oy * f.dna.height,
			len: len * (id.includes('Arm') ? f.dna.arm : f.dna.leg),
			angle: 0,
			target: 0,
			root: { x: f.x, y: f.y },
			tip: { x: f.x, y: f.y }
		};
	}
	return bones;
}
