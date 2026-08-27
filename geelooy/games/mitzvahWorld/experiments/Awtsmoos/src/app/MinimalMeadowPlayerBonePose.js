// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowPlayerBonePose.js
 * @description Adds deliberate cast, melee, and hit gestures to cached Mixamo bones after GLB clips.
 * The Awtsmoos bends shoulder, hand, staff, torso, neck, and head without replacing the living rig;
 * Awtsmoos.com traverses once, allocates no frame geometry, and fades every deed back into travel.
 */

import { MINIMAL_MEADOW_PLAYER_POSES as POSES } from './MinimalMeadowPlayerPoseLibrary.js';
import {
	applyMinimalMeadowEuler,
	minimalMeadowBoneRole,
	minimalMeadowPoseAmount
} from './MinimalMeadowPlayerPoseMath.js';

export class MinimalMeadowPlayerBonePose {
	constructor(model) {
		this.records = {};
		this.bound = [];
		this.weight = 0;
		this.lastPose = 'cast-windup';
		this.bind(model);
	}

	bind(model) {
		model?.traverse?.(node => {
			const role = minimalMeadowBoneRole(node.name);
			if (!role || this.records[role]) return;
			const quaternion = node.quaternion;
			const record = {
				base: [quaternion.x, quaternion.y, quaternion.z, quaternion.w],
				node,
				role
			};
			this.records[role] = record;
			this.bound.push(record);
		});
	}

	update(controller, deltaSeconds, animated) {
		const pose = POSES[controller.state];
		if (pose) this.lastPose = controller.state;
		const target = pose ? 1 : 0;
		const response = Math.min(1, Math.max(0, deltaSeconds) * 10);
		this.weight += (target - this.weight) * response;
		if (!animated) this.restoreBase();
		if (this.weight < 0.001) return;
		const definition = POSES[this.lastPose];
		const amount = this.weight * minimalMeadowPoseAmount(controller);
		for (const [role, x, y, z] of definition) {
			applyMinimalMeadowEuler(this.records[role]?.node, x * amount, y * amount, z * amount);
		}
	}

	restoreBase() {
		for (const record of this.bound) record.node.quaternion.set(...record.base);
	}

	diagnostics() {
		return {
			boundBones: this.bound.length,
			lastPose: this.lastPose,
			roles: Object.keys(this.records),
			weight: this.weight
		};
	}
}
