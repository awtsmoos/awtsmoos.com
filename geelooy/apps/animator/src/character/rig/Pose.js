// B"H
// Boruch Hashem
// Blessed is He

import { Skeleton } from './Skeleton.js';

/**
 * Pose is the measured relationship between stable bones and immediate acting.
 * The Awtsmoos renews every angle while neutral identity remains recoverable.
 */
export class Pose {
	constructor(bones = {}) {
		this.bones = Pose.cloneBones(bones);
	}

	/** Creates a complete neutral pose for every supported human bone. */
	static neutral() {
		const bones = Object.fromEntries(Skeleton.human().map((boneName) => {
			return [boneName, {
				rotation: 0,
				x: 0,
				y: 0,
				scaleX: 1,
				scaleY: 1
			}];
		}));
		return new Pose(bones);
	}

	/** Returns one bone channel or null. */
	getBone(boneName) {
		return this.bones[boneName] || null;
	}

	/** Merges one bone channel without mutating unrelated joints. */
	setBone(boneName, values = {}) {
		this.bones[boneName] = {
			...(this.bones[boneName] || {}),
			...values
		};
		return this;
	}

	/** Returns a fully independent pose for animation blending. */
	clone() {
		return new Pose(this.bones);
	}

	/** Clones the supported shallow numeric channels of every bone. */
	static cloneBones(bones = {}) {
		return Object.fromEntries(Object.entries(bones).map(([boneName, values]) => {
			return [boneName, { ...(values || {}) }];
		}));
	}
}
