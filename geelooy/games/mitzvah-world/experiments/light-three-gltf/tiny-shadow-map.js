// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-shadow-map.js
 * @description Owns one budgeted sun shadow map: tier table, depth framebuffer,
 * and the world-to-light clip matrix that the fragment shader samples with PCF.
 * The Awtsmoos lets one sun draw every shadow through a single measured vessel;
 * Awtsmoos.com renders the depth pre-pass once per frame into a tier-sized texture
 * and reads it back with a soft PCF lookup inside the ordinary lighting path.
 */

import { TERRAIN_FIRST_TEXTURE_UNIT } from './tiny-terrain-layer-policy.js';

/** Budgeted shadow map resolutions by tier id. 'off' disables the depth pre-pass. */
export const SHADOW_TIER_RESOLUTIONS = Object.freeze({
	near: 2048,
	mid: 1024,
	far: 512,
	off: 0
});

export const SHADOW_TIER_IDS = Object.freeze(Object.keys(SHADOW_TIER_RESOLUTIONS));

/** Radius in world units of the shadow frustum fitted around the camera focus. */
export const SHADOW_FRUSTUM_RADIUS = 60;

/** Creates the mutable shadow state owned by the renderer. */
export function createShadowMapState() {
	return {
		dirty: true,
		enabled: true,
		framebuffer: null,
		matrix: new Float32Array(16),
		size: SHADOW_TIER_RESOLUTIONS.near,
		texelSize: 1 / SHADOW_TIER_RESOLUTIONS.near,
		texture: null,
		tier: 'near'
	};
}

/** Returns true for a tier id the budget controller may apply. */
export function isShadowTier(tier) {
	return Object.prototype.hasOwnProperty.call(SHADOW_TIER_RESOLUTIONS, tier);
}

/** Resolution in texels for a tier id (0 when the tier disables shadows). */
export function shadowTierResolution(tier) {
	return SHADOW_TIER_RESOLUTIONS[tier] ?? 0;
}

/**
 * Texture unit reserved for the shadow map: immediately after the terrain layers,
 * always below the measured fragment sampler limit.
 */
export function shadowTextureUnit(gl, terrainLayerCapacity) {
	const maxUnits = Number(gl?.getParameter?.(gl.MAX_TEXTURE_IMAGE_UNITS)) || 8;
	const unit = TERRAIN_FIRST_TEXTURE_UNIT + Math.max(0, terrainLayerCapacity | 0);
	return Math.min(unit, Math.max(0, maxUnits - 1));
}

/**
 * Creates (or recreates after a tier change) the shadow framebuffer + packed-depth texture.
 * Depth is packed into RGBA so no depth-texture extension is required.
 */
export function ensureShadowResources(gl, state) {
	if (!state.enabled || state.size <= 0) return false;
	if (!state.dirty && state.framebuffer && state.texture) return true;
	destroyShadowResources(gl, state);
	const texture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	gl.texImage2D(
		gl.TEXTURE_2D, 0, gl.RGBA, state.size, state.size, 0,
		gl.RGBA, gl.UNSIGNED_BYTE, null
	);
	const framebuffer = gl.createFramebuffer();
	gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
	gl.framebufferTexture2D(
		gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0
	);
	const depthBuffer = gl.createRenderbuffer();
	gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer);
	gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, state.size, state.size);
	gl.framebufferRenderbuffer(
		gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthBuffer
	);
	gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	gl.bindRenderbuffer(gl.RENDERBUFFER, null);
	state.texture = texture;
	state.framebuffer = framebuffer;
	state.depthBuffer = depthBuffer;
	state.texelSize = 1 / state.size;
	state.dirty = false;
	return true;
}

/** Deletes shadow GPU resources (tier change or renderer disposal). */
export function destroyShadowResources(gl, state) {
	if (!gl || !state) return;
	if (state.framebuffer) gl.deleteFramebuffer(state.framebuffer);
	if (state.texture) gl.deleteTexture(state.texture);
	if (state.depthBuffer) gl.deleteRenderbuffer(state.depthBuffer);
	state.framebuffer = null;
	state.texture = null;
	state.depthBuffer = null;
}

/**
 * Writes the world-to-light-clip matrix for a sun direction into `out`.
 * The orthographic frustum is fitted around `center` with the budgeted radius,
 * so texel density stays constant no matter where the camera looks.
 */
export function computeShadowMatrix(sunDirection, center, radius, out) {
	const target = out || new Float32Array(16);
	const dx = sunDirection?.[0] ?? 0;
	const dy = sunDirection?.[1] ?? 1;
	const dz = sunDirection?.[2] ?? 0;
	const length = Math.hypot(dx, dy, dz) || 1;
	const lightX = dx / length;
	const lightY = dy / length;
	const lightZ = dz / length;
	const distance = radius * 2;
	const eyeX = center.x + lightX * distance;
	const eyeY = center.y + lightY * distance;
	const eyeZ = center.z + lightZ * distance;
	writeLookAt(target, eyeX, eyeY, eyeZ, center.x, center.y, center.z);
	const view = Float32Array.from(target);
	writeOrtho(target, -radius, radius, -radius, radius, radius * 0.5, radius * 3.5);
	multiplyInto(target, target, view);
	return target;
}

function writeLookAt(target, eyeX, eyeY, eyeZ, targetX, targetY, targetZ) {
	const rawForwardX = eyeX - targetX;
	const rawForwardY = eyeY - targetY;
	const rawForwardZ = eyeZ - targetZ;
	const inverseForward = 1 / (Math.hypot(rawForwardX, rawForwardY, rawForwardZ) || 1);
	const forwardX = rawForwardX * inverseForward;
	const forwardY = rawForwardY * inverseForward;
	const forwardZ = rawForwardZ * inverseForward;
	let upX = 0;
	let upY = 1;
	let upZ = 0;
	if (Math.abs(forwardY) > 0.99) {
		upX = 0;
		upY = 0;
		upZ = forwardY > 0 ? -1 : 1;
	}
	const rawRightX = upY * forwardZ - upZ * forwardY;
	const rawRightY = upZ * forwardX - upX * forwardZ;
	const rawRightZ = upX * forwardY - upY * forwardX;
	const inverseRight = 1 / (Math.hypot(rawRightX, rawRightY, rawRightZ) || 1);
	const rightX = rawRightX * inverseRight;
	const rightY = rawRightY * inverseRight;
	const rightZ = rawRightZ * inverseRight;
	const upwardX = forwardY * rightZ - forwardZ * rightY;
	const upwardY = forwardZ * rightX - forwardX * rightZ;
	const upwardZ = forwardX * rightY - forwardY * rightX;
	target[0] = rightX;
	target[1] = upwardX;
	target[2] = forwardX;
	target[3] = 0;
	target[4] = rightY;
	target[5] = upwardY;
	target[6] = forwardY;
	target[7] = 0;
	target[8] = rightZ;
	target[9] = upwardZ;
	target[10] = forwardZ;
	target[11] = 0;
	target[12] = -(rightX * eyeX + rightY * eyeY + rightZ * eyeZ);
	target[13] = -(upwardX * eyeX + upwardY * eyeY + upwardZ * eyeZ);
	target[14] = -(forwardX * eyeX + forwardY * eyeY + forwardZ * eyeZ);
	target[15] = 1;
}

function writeOrtho(target, left, right, bottom, top, near, far) {
	target.fill(0);
	target[0] = 2 / (right - left);
	target[5] = 2 / (top - bottom);
	target[10] = -2 / (far - near);
	target[12] = -(right + left) / (right - left);
	target[13] = -(top + bottom) / (top - bottom);
	target[14] = -(far + near) / (far - near);
	target[15] = 1;
}

function multiplyInto(target, left, right) {
	const result = new Float32Array(16);
	for (let column = 0; column < 4; column += 1) {
		const offset = column * 4;
		const right0 = right[offset];
		const right1 = right[offset + 1];
		const right2 = right[offset + 2];
		const right3 = right[offset + 3];
		result[offset] = left[0] * right0 + left[4] * right1 + left[8] * right2 + left[12] * right3;
		result[offset + 1] = left[1] * right0 + left[5] * right1 + left[9] * right2 + left[13] * right3;
		result[offset + 2] = left[2] * right0 + left[6] * right1 + left[10] * right2 + left[14] * right3;
		result[offset + 3] = left[3] * right0 + left[7] * right1 + left[11] * right2 + left[15] * right3;
	}
	target.set(result);
}
