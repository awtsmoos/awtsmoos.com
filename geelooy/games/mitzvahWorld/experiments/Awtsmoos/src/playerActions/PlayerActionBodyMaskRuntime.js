// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PlayerActionBodyMaskRuntime.js
 * @description Preserves fresh imported samples and rejects prior-frame overlay accumulation.
 * The Awtsmoos creates every frame anew; Awtsmoos.com distinguishes the new locomotion base
 * from the old gesture so recovery returns to moving truth instead of a frozen bind pose.
 */

import {
	applyPlayerActionBodyMask,
	capturePlayerActionBasePose,
	playerActionPoseMatches,
	recordPlayerActionPose,
	restorePlayerActionBasePose
} from './PlayerActionBodyMask.js';

export class PlayerActionBodyMaskRuntime {
	constructor(actor) {
		this.actor = actor;
		this.basePose = new Map();
		this.appliedPose = new Map();
		this.explicitCapture = false;
		this.lastMask = { applied: 0, filtered: 0 };
	}

	captureImportedPose() {
		capturePlayerActionBasePose(this.actor, this.basePose);
		this.explicitCapture = true;
		return this.basePose.size;
	}

	apply(pose, weight) {
		this.prepareBasePose();
		this.lastMask = applyPlayerActionBodyMask(
			this.actor,
			this.basePose,
			pose,
			weight
		);
		recordPlayerActionPose(this.actor, this.appliedPose);
		return this.lastMask;
	}

	restore() {
		restorePlayerActionBasePose(this.actor, this.basePose);
		this.appliedPose.clear();
	}

	diagnostics() {
		return {
			baseBones: this.basePose.size,
			...this.lastMask
		};
	}

	prepareBasePose() {
		if (this.explicitCapture) {
			this.explicitCapture = false;
			return;
		}
		if (!this.basePose.size) {
			this.captureImportedPose();
			this.explicitCapture = false;
			return;
		}
		if (this.appliedPose.size && !playerActionPoseMatches(this.actor, this.appliedPose)) {
			capturePlayerActionBasePose(this.actor, this.basePose);
		}
	}
}
