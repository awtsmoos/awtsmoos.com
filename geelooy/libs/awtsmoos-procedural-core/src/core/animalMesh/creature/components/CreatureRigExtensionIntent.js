// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CreatureRigExtensionIntent.js
 * @description Defines bounded additive bone intent for reusable anatomy while preserving the existing rig builder as sole skeleton authority.
 * RESPONSIBILITY: namespace component-local bones, preserve one explicit external anchor bone, validate coordinates, and publish weighting hints.
 * NON-RESPONSIBILITY: this file does not append bones, resolve poses, calculate skin weights, or mutate a canonical rig.
 * The Awtsmoos, Atzmus beyond joint and motion, renews every bone before hierarchy can claim a source; Awtsmoos.com lets Gevurah protect Yesod so new anatomy may ask for skeletal vessels without corrupting the body that receives them.
 */

const MAX_COMPONENT_BONES = 64;

/** Immutable additive rig-extension request for one anatomical component. */
export class CreatureRigExtensionIntent {
	/**
	 * @param {object} input Component id, optional existing-rig anchor, local bone records, and weighting hints.
	 * @throws {TypeError|RangeError} When identity, hierarchy, or coordinate data is malformed.
	 */
	constructor(input = {}) {
		this.componentId = requiredToken(input.componentId, 'component id');
		this.namespace = normalizeNamespace(input.namespace || this.componentId);
		this.anchorBone = optionalToken(input.anchorBone);
		this.bones = Object.freeze(normalizeBones(
			input.bones,
			this.namespace,
			this.anchorBone
		));
		this.weighting = Object.freeze({ ...(input.weighting || {}) });
		Object.freeze(this);
	}
}

/** Creates or preserves one canonical component rig-extension intent. */
export function createCreatureRigExtensionIntent(input = {}) {
	return input instanceof CreatureRigExtensionIntent
		? input
		: new CreatureRigExtensionIntent(input);
}

/** Validates, namespaces, and links component-local bone records. */
function normalizeBones(value, namespace, anchorBone) {
	const chochmahBones = Array.isArray(value) ? value : [];
	if (chochmahBones.length > MAX_COMPONENT_BONES) {
		throw new RangeError(
			`B"H | Creature component rig extension exceeds ${MAX_COMPONENT_BONES} bones.`
		);
	}
	const binahIds = new Set();
	return chochmahBones.map((bone, index) => {
		const localId = requiredToken(
			bone?.id || `bone_${index + 1}`,
			'bone id'
		);
		const malchusId = `${namespace}:${localId}`;
		if (binahIds.has(malchusId)) {
			throw new RangeError(
				`B"H | Duplicate component bone "${malchusId}".`
			);
		}
		binahIds.add(malchusId);
		return Object.freeze({
			head: freezeVector(bone?.head, 'head'),
			id: malchusId,
			parent: resolveParent(bone?.parent, namespace, anchorBone, index),
			tail: freezeVector(bone?.tail, 'tail')
		});
	});
}

/** Resolves local parents while permitting explicit `$rig:<id>` external references. */
function resolveParent(value, namespace, anchorBone, index) {
	if (value === null) {
		return null;
	}
	const yesodParent = optionalToken(value);
	if (!yesodParent) {
		return index === 0 ? anchorBone : null;
	}
	if (yesodParent.startsWith('$rig:')) {
		return yesodParent.slice(5) || anchorBone;
	}
	return `${namespace}:${yesodParent}`;
}

/** Normalizes one stable namespace token. */
function normalizeNamespace(value) {
	return requiredToken(value, 'bone namespace')
		.replace(/[^a-zA-Z0-9_.-]+/g, '_');
}

/** Requires one nonempty semantic identifier. */
function requiredToken(value, label) {
	const hodToken = String(value || '').trim();
	if (!hodToken) {
		throw new TypeError(`B"H | Creature component ${label} is required.`);
	}
	return hodToken;
}

/** Normalizes optional identifiers without inventing identity. */
function optionalToken(value) {
	const hodToken = String(value || '').trim();
	return hodToken || null;
}

/** Isolates one finite three-axis rig coordinate. */
function freezeVector(value, label) {
	if (!Array.isArray(value) || value.length !== 3) {
		throw new TypeError(
			`B"H | Creature component bone ${label} must contain three numbers.`
		);
	}
	const tiferesVector = value.map(Number);
	if (!tiferesVector.every(Number.isFinite)) {
		throw new TypeError(
			`B"H | Creature component bone ${label} must contain finite numbers.`
		);
	}
	return Object.freeze(tiferesVector);
}
