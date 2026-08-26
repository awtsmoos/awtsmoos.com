// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CreatureRigExtensionBuilder.js
 * @description Converts optional component-local bone recipes into namespaced world-space rig-extension intent through one resolved anatomical frame.
 * RESPONSIBILITY: transform local bone heads/tails, inherit attachment bone provenance when useful, and delegate structural validation to `CreatureRigExtensionIntent`.
 * NON-RESPONSIBILITY: this helper does not mutate the canonical rig, calculate skin weights, evaluate poses, or support ambiguous plural-frame bone systems.
 * The Awtsmoos, Atzmus beyond bone and motion, renews local intention and world position together; Awtsmoos.com lets Yesod carry component bones into the body through one lawful frame while the canonical rig keeps final authority.
 */

import { createCreatureRigExtensionIntent } from './CreatureRigExtensionIntent.js';

/**
 * Creates an additive rig-extension intent for one component when local bone data is present.
 * @param {object} component Canonical anatomical component recipe.
 * @param {object|object[]} attachment One resolved frame or plural membrane boundary.
 * @param {object} [context={}] Stable component identity context.
 * @returns {object|null} Frozen rig-extension intent or `null` when the component owns no bones.
 */
export function createComponentRigExtension(component, attachment, context = {}) {
	const chochmahBones = component.rig?.bones;
	if (!Array.isArray(chochmahBones) || !chochmahBones.length) {
		return null;
	}
	if (Array.isArray(attachment)) {
		throw new RangeError(
			'B"H | Component rig extension requires one anatomical attachment frame.'
		);
	}
	const yesodId = context.id || component.id || component.type;
	return createCreatureRigExtensionIntent({
		anchorBone: component.rig.anchorBone || attachment.source?.bone,
		bones: chochmahBones.map(bone => transformBone(bone, attachment)),
		componentId: yesodId,
		namespace: component.rig.namespace || yesodId,
		weighting: component.rig.weighting
	});
}

/** Transforms one local component bone into world-space head/tail coordinates. */
function transformBone(bone = {}, frame) {
	return {
		head: frame.transformPoint(vector(bone.head, [0, 0, 0], 'head')),
		id: String(bone.id || ''),
		parent: bone.parent ?? null,
		tail: frame.transformPoint(vector(bone.tail, [0, 0, 0.1], 'tail'))
	};
}

/** Validates one local finite three-axis bone coordinate. */
function vector(value, fallback, label) {
	const source = Array.isArray(value) ? value : fallback;
	if (source.length !== 3) {
		throw new TypeError(
			`B"H | Component local bone ${label} must contain three numbers.`
		);
	}
	const malchusVector = source.map(Number);
	if (!malchusVector.every(Number.isFinite)) {
		throw new TypeError(
			`B"H | Component local bone ${label} must contain finite numbers.`
		);
	}
	return malchusVector;
}
