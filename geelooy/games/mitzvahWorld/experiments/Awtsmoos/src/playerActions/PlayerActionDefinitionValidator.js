// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PlayerActionDefinitionValidator.js
 * @description Rejects malformed or unsafe declarative player-action definitions.
 * The Awtsmoos grants possibility without chaos; Awtsmoos.com limits each authored gesture
 * to finite timing, known roles, one message, and data that the runtime can inspect.
 */

import {
	PLAYER_ACTION_BONE_ROLES,
	PLAYER_ACTION_LAYERS
} from './PlayerActionConstants.js';

const ROLE_SET = new Set(PLAYER_ACTION_BONE_ROLES);
const LAYER_SET = new Set(PLAYER_ACTION_LAYERS);

export function validatePlayerActionDefinition(definition) {
	requireText(definition?.id, 'ACTION_ID_REQUIRED');
	requireText(definition?.messageType, 'ACTION_MESSAGE_REQUIRED');
	requireNumber(definition?.version, 'ACTION_VERSION_REQUIRED', 1);
	requireNumber(definition?.duration, 'ACTION_DURATION_REQUIRED', 0.05);
	requireNumber(definition?.releaseAt, 'ACTION_RELEASE_AT_REQUIRED', 0, 1);
	if (!LAYER_SET.has(definition.layer)) {
		throw new Error('ACTION_LAYER_INVALID');
	}
	if (!Array.isArray(definition.keyframes) || definition.keyframes.length < 2) {
		throw new Error('ACTION_KEYFRAMES_REQUIRED');
	}
	validateEquipment(definition.requiredEquipment);
	validateKeyframes(definition.keyframes);
	return Object.freeze({
		...definition,
		keyframes: Object.freeze(definition.keyframes.map(freezeFrame))
	});
}

function validateEquipment(requirement) {
	if (!requirement) {
		return;
	}
	requireText(requirement.slot, 'ACTION_EQUIPMENT_SLOT_REQUIRED');
	if (!Array.isArray(requirement.itemIds) || !requirement.itemIds.length) {
		throw new Error('ACTION_EQUIPMENT_ITEMS_REQUIRED');
	}
	for (const itemId of requirement.itemIds) {
		requireText(itemId, 'ACTION_EQUIPMENT_ITEM_INVALID');
	}
}

function validateKeyframes(keyframes) {
	let previous = -1;
	for (const frame of keyframes) {
		requireNumber(frame?.at, 'ACTION_KEYFRAME_TIME_INVALID', 0, 1);
		if (frame.at < previous) {
			throw new Error('ACTION_KEYFRAME_ORDER_INVALID');
		}
		previous = frame.at;
		for (const [role, rotation] of Object.entries(frame.pose || {})) {
			if (!ROLE_SET.has(role)) {
				throw new Error(`ACTION_BONE_ROLE_INVALID:${role}`);
			}
			if (!Array.isArray(rotation) || rotation.length !== 3) {
				throw new Error(`ACTION_ROTATION_INVALID:${role}`);
			}
			for (const value of rotation) {
				requireNumber(value, `ACTION_ROTATION_INVALID:${role}`);
			}
		}
	}
	if (keyframes[0].at !== 0 || keyframes.at(-1).at !== 1) {
		throw new Error('ACTION_KEYFRAME_BOUNDARIES_REQUIRED');
	}
}

function freezeFrame(frame) {
	const pose = {};
	for (const [role, rotation] of Object.entries(frame.pose || {})) {
		pose[role] = Object.freeze([...rotation]);
	}
	return Object.freeze({ at: frame.at, pose: Object.freeze(pose) });
}

function requireText(value, code) {
	if (typeof value !== 'string' || !value.trim()) {
		throw new Error(code);
	}
}

function requireNumber(value, code, minimum = -Infinity, maximum = Infinity) {
	if (!Number.isFinite(value) || value < minimum || value > maximum) {
		throw new Error(code);
	}
}
