// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PlayerActionActor.js
 * @description Applies custom action rotations from immutable bind-pose quaternions.
 * The Awtsmoos creates base and gesture without cumulative distortion; Awtsmoos.com keeps
 * every unsampled arm from multiplying yesterday's offset into a visible T-pose.
 */

import { applyMinimalMeadowEuler } from '../app/MinimalMeadowPlayerPoseMath.js';
import { resolvePlayerActionBones } from './PlayerActionBoneResolver.js';

export class PlayerActionActor {
	constructor(options) {
		this.id = options.id || 'actor';
		this.bus = options.bus || null;
		this.equipment = options.equipment || null;
		this.model = null;
		this.bones = {};
		this.bindQuaternions = {};
		this.ambiguities = {};
		this.bindModel(options.model);
	}

	bindModel(model) {
		this.model = model || null;
		const result = resolvePlayerActionBones(model);
		this.bones = result.records;
		this.ambiguities = result.ambiguities;
		this.bindQuaternions = Object.fromEntries(
			Object.entries(this.bones).map(([role, node]) => [
				role,
				quaternionRecord(node.quaternion)
			])
		);
		return this.diagnostics();
	}

	equipped(slot) {
		if (typeof this.equipment?.equipped === 'function') {
			return this.equipment.equipped(slot);
		}
		if (slot === 'hand') {
			return this.equipment?.weaponItemId || null;
		}
		return this.equipment?.[slot] || null;
	}

	canPerform(definition) {
		const requirement = definition.requiredEquipment;
		if (!requirement) {
			return { accepted: true };
		}
		const itemId = this.equipped(requirement.slot);
		return requirement.itemIds.includes(itemId)
			? { accepted: true, itemId }
			: { accepted: false, itemId, reason: 'ACTION_EQUIPMENT_REQUIRED' };
	}

	apply(pose, weight) {
		for (const [role, rotation] of pose) {
			const bone = this.bones[role];
			const base = this.bindQuaternions[role];
			if (!bone || !base) {
				continue;
			}
			bone.quaternion.set(base.x, base.y, base.z, base.w);
			applyMinimalMeadowEuler(
				bone,
				rotation[0] * weight,
				rotation[1] * weight,
				rotation[2] * weight
			);
		}
	}

	diagnostics() {
		return {
			actorId: this.id,
			ambiguities: { ...this.ambiguities },
			bindQuaternionCount: Object.keys(this.bindQuaternions).length,
			boundBones: Object.keys(this.bones).length,
			model: this.model?.name || null,
			roles: Object.keys(this.bones)
		};
	}
}

function quaternionRecord(quaternion = {}) {
	return Object.freeze({
		w: Number.isFinite(quaternion.w) ? quaternion.w : 1,
		x: Number(quaternion.x) || 0,
		y: Number(quaternion.y) || 0,
		z: Number(quaternion.z) || 0
	});
}
