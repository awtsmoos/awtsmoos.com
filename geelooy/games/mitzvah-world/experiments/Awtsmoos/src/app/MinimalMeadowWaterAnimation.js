// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowWaterAnimation.js
 * @description Advances river and lake texture currents through reusable buffers with adaptive cosmetic cost.
 * The Awtsmoos renews every wave without wasting a vessel; Awtsmoos.com lets current, shimmer, and ripple stay alive,
 * while finite frame-time pressure quiets decoration before it ever silences responsive play.
 */

import {
	MINIMAL_MEADOW_WATER_FLOW,
	MINIMAL_MEADOW_WATER_SURFACE
} from './MinimalMeadowWaterFlowProfiles.js';

/**
 * @description Allocates the four offset buffers once, before frame updates begin.
 * @param {Array<object>} meshes Mounted water-family meshes.
 * @returns {number} Number of animated water surfaces prepared.
 */
export function prepareMinimalMeadowWaterAnimation(meshes) {
	let prepared = 0;
	for (let index = 0; index < meshes.length; index += 1) {
		const mesh = meshes[index];
		if (!mesh.material || !mesh.userData?.waterVariant) {
			continue;
		}
		ensureOffset(mesh.material, 'mapOffset');
		ensureOffset(mesh.material, 'mixOffset');
		ensureOffset(mesh.material, 'normalOffset');
		ensureOffset(mesh.material, 'normalDetailOffset');
		prepared += 1;
	}
	return prepared;
}

/**
 * @description Advances visible water flow without steady-state array allocation and sheds cosmetic work by quality stride.
 * @param {Array<object>} meshes Mounted water-family meshes.
 * @param {number} clock Elapsed water animation time in seconds.
 * @param {Readonly<object>} policy Shared adaptive water-quality policy.
 * @param {number} frameIndex Monotonic water update counter.
 * @returns {number} Number of surfaces animated during this frame.
 */
export function animateMinimalMeadowWaterMaterials(meshes, clock, policy, frameIndex) {
	if (frameIndex % policy.updateStride !== 0) {
		return 0;
	}
	let updated = 0;
	for (let index = 0; index < meshes.length; index += 1) {
		const mesh = meshes[index];
		const variant = mesh.userData?.waterVariant;
		if (!mesh.material || !variant) {
			continue;
		}
		animateSurface(mesh.material, variant, clock, policy);
		updated += 1;
	}
	return updated;
}

/**
 * @description Mutates one water material using stable offset buffers and a bounded quality-scaled shimmer law.
 * @param {object} material Tiny-runtime material for a water surface.
 * @param {string} variant Water variant name.
 * @param {number} clock Elapsed animation time in seconds.
 * @param {Readonly<object>} policy Shared adaptive water-quality policy.
 * @returns {void}
 */
function animateSurface(material, variant, clock, policy) {
	const flow = MINIMAL_MEADOW_WATER_FLOW[variant] || MINIMAL_MEADOW_WATER_FLOW.lake;
	const surface = MINIMAL_MEADOW_WATER_SURFACE[variant] || MINIMAL_MEADOW_WATER_SURFACE.lake;
	const scaledClock = clock * policy.flowScale;
	setOffset(material.mapOffset, scaledClock, flow.mapX, flow.mapY);
	setOffset(material.mixOffset, scaledClock, flow.mixX, flow.mixY);
	setOffset(material.normalOffset, scaledClock, flow.normalX, flow.normalY);
	setOffset(material.normalDetailOffset, scaledClock, flow.detailX, flow.detailY);
	const shimmer = Math.sin(clock * surface.shimmerRate + surface.phase) * policy.shimmerAmplitude;
	material.mixStrength = surface.mixStrength * policy.detailScale * (1 + shimmer);
	material.opacity = surface.opacity + shimmer * 0.45;
	if (material.texturePolicy) {
		material.texturePolicy.time = clock;
	}
}

/**
 * @description Ensures one stable two-component offset buffer exists before animation begins.
 * @param {object} material Runtime material.
 * @param {string} key Offset field.
 * @returns {Array<number>} Stable offset buffer.
 */
function ensureOffset(material, key) {
	if (!Array.isArray(material[key])) {
		material[key] = [0, 0];
	}
	return material[key];
}

/**
 * @description Writes wrapped flow coordinates into an existing offset buffer without replacement.
 * @param {Array<number>} target Stable two-component offset buffer.
 * @param {number} clock Scaled animation clock.
 * @param {number} x X flow velocity.
 * @param {number} y Y flow velocity.
 * @returns {void}
 */
function setOffset(target, clock, x, y) {
	target[0] = wrap(clock * x);
	target[1] = wrap(clock * y);
}

/**
 * @description Wraps one scalar into the unit interval used by repeating texture coordinates.
 * @param {number} value Scalar texture coordinate.
 * @returns {number} Wrapped coordinate.
 */
function wrap(value) {
	return value - Math.floor(value);
}
