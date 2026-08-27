// B"H
// Boruch Hashem
// Blessed is He

import { Pose } from './Pose.js';
import { Skeleton } from './Skeleton.js';

/**
 * CharacterRig joins stable anatomy, immediate pose, wardrobe, and face without
 * confusing them. The Awtsmoos renews the performance while identity persists.
 */
export class CharacterRig {
	constructor({
		id = 'anonymous-rig',
		skeleton = Skeleton.human(),
		pose = Pose.neutral(),
		outfit = null,
		face = null
	} = {}) {
		this.id = id;
		this.skeleton = Array.isArray(skeleton) ? [...skeleton] : Skeleton.human();
		this.pose = pose instanceof Pose ? pose : new Pose(pose?.bones || pose || {});
		this.outfit = outfit;
		this.face = face;
	}

	/** Replaces the current pose while preserving rig identity. */
	setPose(pose) {
		this.pose = pose instanceof Pose ? pose : new Pose(pose?.bones || pose || {});
		return this;
	}

	/** Applies one bone channel through the owned pose. */
	setBone(boneName, values) {
		if (!Skeleton.includes(this.skeleton, boneName)) {
			throw new Error(`Unknown rig bone: ${boneName}`);
		}
		this.pose.setBone(boneName, values);
		return this;
	}

	/** Replaces wardrobe without disturbing anatomy or acting. */
	setOutfit(outfit) {
		this.outfit = outfit;
		return this;
	}

	/** Replaces facial state without disturbing body performance. */
	setFace(face) {
		this.face = face;
		return this;
	}

	/** Produces a serializable production snapshot. */
	snapshot() {
		return {
			id: this.id,
			skeleton: [...this.skeleton],
			pose: this.pose.clone(),
			outfit: this.outfit,
			face: this.face
		};
	}
}
