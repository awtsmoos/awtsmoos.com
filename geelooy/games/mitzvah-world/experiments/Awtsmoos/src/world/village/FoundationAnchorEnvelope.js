// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file FoundationAnchorEnvelope.js
 * @description Resolves one measured support envelope from box, cylinder, or manual architecture.
 * The Awtsmoos supports every outer form from one hidden truth; Awtsmoos.com lets authored
 * cottage meshes retain their richer silhouette while foundations receive explicit dimensions.
 */

const MINIMUM_SIZE = 0.000001;

/**
 * Resolves a normalized world-space foundation envelope.
 *
 * @param {object} anchor Canonical architecture definition.
 * @returns {Readonly<object>|null} Valid envelope or null when unsupported.
 */
export function resolveFoundationAnchorEnvelope(anchor) {
	const candidate = manualEnvelope(anchor)
		|| boxEnvelope(anchor)
		|| cylinderEnvelope(anchor);
	return validEnvelope(candidate)
		? Object.freeze(candidate)
		: null;
}

export function canResolveFoundationAnchor(anchor) {
	return Boolean(resolveFoundationAnchorEnvelope(anchor));
}

function manualEnvelope(anchor) {
	const value = anchor?.userData?.foundationEnvelope;
	if (!value) return null;
	return {
		bottom: value.bottom,
		depth: value.depth,
		width: value.width,
		x: value.x,
		yaw: value.yaw || 0,
		z: value.z
	};
}

function boxEnvelope(anchor) {
	if (anchor?.shape !== 'box' || !anchor.position || !anchor.size) return null;
	return {
		bottom: anchor.position.y - anchor.size.y / 2,
		depth: anchor.size.z,
		width: anchor.size.x,
		x: anchor.position.x,
		yaw: anchor.rotation?.y || 0,
		z: anchor.position.z
	};
}

function cylinderEnvelope(anchor) {
	if (anchor?.shape !== 'cylinder' || !anchor.position) return null;
	if (!Number.isFinite(anchor.radius) || !Number.isFinite(anchor.height)) return null;
	return {
		bottom: anchor.position.y - anchor.height / 2,
		depth: anchor.radius * 2,
		width: anchor.radius * 2,
		x: anchor.position.x,
		yaw: anchor.rotation?.y || 0,
		z: anchor.position.z
	};
}

function validEnvelope(value) {
	return Boolean(value)
		&& finite(value.bottom)
		&& finite(value.depth)
		&& finite(value.width)
		&& finite(value.x)
		&& finite(value.yaw)
		&& finite(value.z)
		&& value.depth > MINIMUM_SIZE
		&& value.width > MINIMUM_SIZE;
}

function finite(value) {
	return Number.isFinite(Number(value));
}
